import crypto from 'crypto';
import admin from 'firebase-admin';

export const config = {
  api: {
    bodyParser: false, // disable body parsing to get raw buffer
  },
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // The service account is base64 encoded in the environment variable
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString()
    );
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    
    console.log('✅ Firebase Admin initialized for project:', serviceAccount.project_id);
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw new Error('Failed to initialize Firebase Admin: ' + error.message);
  }
}

const db = admin.firestore();
const LEMON_SECRET = process.env.LEMONSQUEEZY_SECRET || process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

function verifySignature(rawBody, signature, secret) {
  try {
    if (!signature || !secret) {
      console.error('❌ Missing signature or secret');
      return false;
    }
    const hash = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(signature)
    );
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

// Test webhook handler for development
export const testWebhook = async (req, res) => {
  try {
    // Simulate a webhook event
    const testEvent = {
      meta: {
        event_name: 'subscription_created',
        custom_data: {
          user_id: 'adnan-user-123',
          email: 'adnanwork445@gmail.com'
        }
      },
      data: {
        id: 'test-sub-123',
        type: 'subscriptions',
        attributes: {
          status: 'active',
          status_formatted: 'Active',
          user_email: 'adnanwork445@gmail.com',
          order_id: 12345,
          renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          urls: {
            customer_portal: 'https://app.lemonsqueezy.com/customer-portal/test'
          }
        }
      }
    };

    // Process the test event
    await processWebhook(testEvent, res);
  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(500).json({ error: 'Test webhook failed', details: error.message });
  }
};

// Log test endpoint availability in development
if (process.env.NODE_ENV === 'development') {
  console.log('🛠️  Development mode: Test endpoint available at /api/lemon-webhook/test');
}

// Process webhook event
async function processWebhook(event, res) {
  const type = event.meta?.event_name;
  const attrs = event.data?.attributes || {};
  const userEmail = attrs.user_email;

  if (!userEmail) {
    console.error('❌ No email in event payload');
    return res.status(400).send('No user email in event');
  }

  try {
    console.log(`🔍 Looking up user with email: ${userEmail}`);
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', userEmail).limit(1).get();

    if (snapshot.empty) {
      console.error(`❌ No user found for email: ${userEmail}`);
      return res.status(404).json({ error: 'User not found' });
    }

    const userDoc = snapshot.docs[0];
    const userRef = userDoc.ref;
    console.log(`✅ Found user: ${userDoc.id}`);

    // Get subscription details
    const subscriptionId = event.data?.id;
    const orderId = attrs?.order_id?.toString();
    const subscriptionUrl = orderId 
      ? `https://app.lemonsqueezy.com/my-orders/${orderId}`
      : attrs?.urls?.customer_portal;
    
    const subscriptionStatus = attrs?.status || attrs?.status_formatted || 'active';
    const renewsAt = attrs?.renews_at ? new Date(attrs.renews_at) : null;
    const endsAt = attrs?.ends_at ? new Date(attrs.ends_at) : null;

    console.log('📊 Processing event:', {
      type,
      status: subscriptionStatus,
      renewsAt: renewsAt?.toISOString(),
      endsAt: endsAt?.toISOString(),
      subscriptionId,
      orderId
    });

    // Handle different subscription events
    const isActiveEvent = [
      'order_created',
      'subscription_created',
      'subscription_updated',
      'subscription_payment_success',
      'subscription_plan_changed',
      'subscription_resumed'
    ].includes(type);

    const isCancelledEvent = [
      'subscription_cancelled',
      'subscription_expired',
      'subscription_payment_failed',
      'subscription_paused'
    ].includes(type);

    const updateData = {
      subscriptionStatus,
      subscriptionId,
      orderId,
      subscriptionUrl,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (isActiveEvent) {
      Object.assign(updateData, {
        plan: 'pro',
        isSubscribed: true,
        renewsAt: renewsAt || admin.firestore.FieldValue.delete(),
        subscriptionEndsAt: admin.firestore.FieldValue.delete(),
        willCancelAtPeriodEnd: false,
        lastSubscriptionUpdate: admin.firestore.FieldValue.serverTimestamp()
      });
      
      if (renewsAt) {
        updateData.renewsAt = renewsAt;
      }
      
      console.log(`🔄 Updating active subscription for ${userEmail}`, updateData);
    } 
    else if (isCancelledEvent) {
      Object.assign(updateData, {
        plan: 'free',
        isSubscribed: false,
        subscriptionStatus: 'cancelled',
        willCancelAtPeriodEnd: false,
        subscriptionCancelledAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      if (endsAt) {
        updateData.subscriptionEndsAt = endsAt;
      }
      
      console.log(`🔄 Updating cancelled subscription for ${userEmail}`, updateData);
    } else {
      console.log(`ℹ️ Unhandled event type: ${type}`);
      return res.status(200).json({ received: true, message: 'Event not processed' });
    }

    // Update the user document with subscription info
    try {
      await userRef.update(updateData);
      console.log(`✅ Successfully updated subscription for ${userEmail}:`, {
        type,
        status: subscriptionStatus,
        plan: updateData.plan
      });

      return res.status(200).json({
        success: true,
        message: 'Webhook processed successfully',
        event: type,
        userId: userDoc.id,
        timestamp: new Date().toISOString()
      });
    } catch (updateError) {
      console.error('❌ Error updating user subscription:', updateError);
      throw new Error(`Failed to update user subscription: ${updateError.message}`);
    }
  } catch (error) {
    console.error('🔥 Webhook processing error:', {
      error: error.message,
      stack: error.stack,
      event: type,
      userEmail,
      timestamp: new Date().toISOString()
    });
    throw error; // Re-throw to be handled by the main handler
  }
}

// Main webhook handler (Express.js style)
const webhookHandler = async (req, res) => {
  console.log('🔔 Webhook received:', req.method, req.url);
  
  // Handle test endpoint in development
  if (process.env.NODE_ENV === 'development' && req.method === 'GET' && req.url.endsWith('/test')) {
    console.log('🛠️  Test endpoint called');
    return testWebhook(req, res);
  }
  
  // Handle actual webhook
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Get raw body
  let rawBody;
  try {
    rawBody = await new Promise((resolve) => {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks)));
    });
  } catch (error) {
    console.error('❌ Error reading request body:', error);
    return res.status(400).send('Error reading request body');
  }

  console.log('📦 Webhook received:', rawBody.toString('utf8'));

  // Get signature from headers (case-insensitive)
  const signature = 
    req.headers['x-signature'] || 
    req.headers['X-Signature'] || 
    req.headers['X-SIGNATURE'];
  
  if (!signature) {
    console.error('❌ No signature found in headers');
    return res.status(400).send('No signature provided');
  }

  if (!LEMON_SECRET) {
    console.error('❌ LEMONSQUEEZY_SECRET is not set');
    return res.status(500).send('Server configuration error');
  }

  const isValid = verifySignature(rawBody, signature, LEMON_SECRET);
  if (!isValid) {
    console.error('❌ Invalid signature');
    console.log('Expected secret:', LEMON_SECRET ? '***' : 'undefined');
    console.log('Received signature:', signature);
    return res.status(400).send('Invalid signature');
  }

  // Parse event data
  let event;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
    console.log('📝 Webhook event received:', JSON.stringify({
      id: event.meta?.event_name,
      type: event.meta?.event_name,
      data: event.data
    }, null, 2));
  } catch (error) {
    console.error('❌ Error parsing webhook payload:', error);
    return res.status(400).send('Invalid JSON payload');
  }

  // Process the webhook event
  return processWebhook(event, res);
};

// Export the main handler
export default webhookHandler;

// If you want to run this file directly for testing, uncomment the following:
/*
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Running in test mode...');
  const testRequest = {
    method: 'GET',
    url: '/test'
  };
  
  const testResponse = {
    status: (code) => {
      console.log(`Status: ${code}`);
      return testResponse;
    },
    json: (data) => console.log('Response:', JSON.stringify(data, null, 2)),
    send: (data) => console.log('Response:', data)
  };
  
  webhookHandler(testRequest, testResponse)
    .catch(console.error);
}
*/

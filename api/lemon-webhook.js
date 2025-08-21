import { db } from '../lib/firebase-admin';
import crypto from 'crypto';

// Helper to get raw body
function getRawBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

// Verify webhook signature
function verifySignature(rawBody, signature, secret) {
  if (!signature || !secret) {
    console.error('❌ Missing signature or secret');
    return false;
  }

  const hash = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(signature)
  );
}

// Process webhook event
async function processWebhook(event, res) {
  const type = event.meta?.event_name;
  const attrs = event.data?.attributes || {};
  const userEmail = attrs.user_email;

  if (!userEmail) {
    console.error('❌ No email in event payload');
    return res.status(400).json({ error: 'No user email in event' });
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

    // Get the subscription ID from the webhook
    const subscriptionId = attrs.subscription_id;
    if (!subscriptionId) {
      console.error('❌ No subscription_id in webhook payload');
      return res.status(400).json({ error: 'Webhook payload missing subscription_id' });
    }

    // Fetch the full subscription object from Lemon Squeezy
    const lemonResponse = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`, {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Authorization': `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`
      }
    });

    if (!lemonResponse.ok) {
      console.error('❌ Failed to fetch subscription from Lemon Squeezy');
      throw new Error('Failed to fetch subscription details');
    }

    const subscription = await lemonResponse.json();
    const subAttrs = subscription.data.attributes;

    // Prepare the data for Firestore
    const subscriptionData = {
      subscriptionId: subscription.data.id,
      planId: subAttrs.variant_id,
      subscriptionStatus: subAttrs.status,
      renewsAt: subAttrs.renews_at ? new Date(subAttrs.renews_at) : null,
      endsAt: subAttrs.ends_at ? new Date(subAttrs.ends_at) : null,
      trialEndsAt: subAttrs.trial_ends_at ? new Date(subAttrs.trial_ends_at) : null,
      updatedAt: new Date().toISOString(),
    };

    // Update the user's document in Firestore
    await userRef.update(subscriptionData);

    console.log(`✅ Subscription for ${userEmail} updated successfully. Status: ${subAttrs.status}`);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('🔥 Webhook processing error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Vercel Serverless Function Handler
export default async function handler(req, res) {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-signature');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get raw body for signature verification
    const rawBody = await getRawBody(req);
    const signature = req.headers['x-signature'];
    const secret = process.env.LEMONSQUEEZY_SECRET;

    // Verify webhook signature
    if (process.env.NODE_ENV === 'production' && !verifySignature(rawBody, signature, secret)) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Parse the event
    const event = JSON.parse(rawBody.toString('utf8'));
    console.log('📦 Webhook event received:', event.meta?.event_name);

    // Process the webhook
    return await processWebhook(event, res);
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return res.status(400).json({ 
      error: 'Error processing webhook',
      details: error.message 
    });
  }
}
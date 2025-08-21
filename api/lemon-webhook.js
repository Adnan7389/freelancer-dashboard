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
async function processWebhook(event) {
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

    const subscriptionId = attrs.subscription_id;
    if (!subscriptionId) {
      console.error('❌ No subscription_id in webhook payload');
      return res.status(400).json({ error: 'Webhook payload missing subscription_id' });
    }

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

    const subscriptionData = {
      subscriptionId: subscription.data.id,
      planId: subAttrs.variant_id,
      subscriptionStatus: subAttrs.status,
      renewsAt: subAttrs.renews_at ? new Date(subAttrs.renews_at) : null,
      endsAt: subAttrs.ends_at ? new Date(subAttrs.ends_at) : null,
      trialEndsAt: subAttrs.trial_ends_at ? new Date(subAttrs.trial_ends_at) : null,
      updatedAt: new Date().toISOString(),
    };

    await userRef.update(subscriptionData);

    console.log(`✅ Subscription for ${userEmail} updated successfully. Status: ${subAttrs.status}`);

    return { status: 200, data: { success: true }};
  } catch (error) {
    console.error('🔥 Webhook processing error:', error);
    return { status: 500, data: { error: error.message }};
  }
}

// Main handler for the Vercel serverless function
export default async function handler(req, res) {
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-signature');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers['x-signature'];
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

    if (!verifySignature(rawBody, signature, secret)) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(rawBody.toString());
    const result = await processWebhook(event);
    return res.status(result.status).json(result.data);

  } catch (error) {
    console.error('🔥 Error in webhook handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
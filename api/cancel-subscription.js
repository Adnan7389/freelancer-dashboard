import { db, auth } from '../../lib/firebase-admin';
import axios from 'axios';

const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;

if (!LEMON_SQUEEZY_API_KEY) {
  console.error('LEMON_SQUEEZY_API_KEY is not set');
  throw new Error('Server configuration error');
}

// Default export for the API route handler
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Verify the user's authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Get user's subscription data
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const subscriptionId = userDoc.data().subscriptionId;
    if (!subscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Cancel subscription via Lemon Squeezy API
    const lemonResponse = await axios.patch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`,
      {
        data: {
          type: 'subscriptions',
          id: subscriptionId,
          attributes: {
            cancelled: true
          }
        }
      },
      {
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          'Authorization': `Bearer ${LEMON_SQUEEZY_API_KEY}`
        }
      }
    );

    // Update Firestore with cancellation details
    const endsAt = lemonResponse.data.data.attributes.ends_at;
    await db.collection('users').doc(userId).update({
      isSubscribed: true, // Keep access until period ends
      subscriptionStatus: 'cancelled',
      willCancelAtPeriodEnd: true,
      subscriptionCancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      subscriptionEndsAt: endsAt ? new Date(endsAt).toISOString() : null,
      lastSubscriptionUpdate: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Subscription cancellation processed. Access will end on: ${endsAt}`);

    return res.status(200).json({ message: 'Subscription canceled successfully' });
  } catch (error) {
    console.error('Error in cancel-subscription handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

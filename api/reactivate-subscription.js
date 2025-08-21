import { db, auth } from '../../lib/firebase-admin';
import axios from 'axios';

const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;

if (!LEMON_SQUEEZY_API_KEY) {
  console.error('LEMON_SQUEEZY_API_KEY is not set');
  throw new Error('Server configuration error');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify the user's authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Get the user's subscription ID from Firestore
    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { subscriptionId, subscriptionStatus } = userDoc.data();

    if (!subscriptionId || subscriptionStatus !== 'cancelled') {
      return res.status(400).json({ error: 'No subscription to reactivate.' });
    }

    // Reactivate the subscription via the Lemon Squeezy API
    const lemonResponse = await axios.patch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`,
      {
        data: {
          type: 'subscriptions',
          id: subscriptionId,
          attributes: {
            cancelled: false,
          },
        },
      },
      {
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          'Authorization': `Bearer ${LEMON_SQUEEZY_API_KEY}`,
        },
      }
    );

    // Update Firestore with the new subscription status
    const { renews_at } = lemonResponse.data.data.attributes;
    await userDocRef.update({
      subscriptionStatus: 'active',
      willCancelAtPeriodEnd: false,
      subscriptionEndsAt: null,
      renewsAt: new Date(renews_at),
      updatedAt: new Date().toISOString(),
    });

    res.status(200).json({ success: true, message: 'Subscription reactivated successfully.' });

  } catch (error) {
    console.error('Error reactivating subscription:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to reactivate subscription.' });
  }
}

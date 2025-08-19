import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import axios from 'axios';

// Initialize Firebase Admin if not already done
const apps = getApps();
const admin = apps.length ? getApp() : initializeApp({
  credential: cert(JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString()
  ))
});

const db = getFirestore(admin);
const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;

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
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Get user's subscription data
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.error('User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const subscriptionId = userData.subscriptionId;

    if (!subscriptionId) {
      console.error('No subscription ID found for user:', userId);
      return res.status(400).json({ 
        error: 'No active subscription found',
        details: 'No subscription ID found in user document' 
      });
    }
    
    console.log(`Cancelling subscription ${subscriptionId} for user ${userId}`);

    try {
      // Call Lemon Squeezy API to cancel the subscription
      const response = await axios.patch(
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
            'Authorization': `Bearer ${LEMON_SQUEEZY_API_KEY}`,
            'Cache-Control': 'no-cache'
          },
          validateStatus: status => status < 500
        }
      );
      
      console.log('Lemon Squeezy API response:', {
        status: response.status,
        data: response.data
      });

      if (response.status >= 400) {
        throw new Error(`Lemon Squeezy API error: ${response.status} - ${JSON.stringify(response.data)}`);
      }

      // Update user's subscription status in Firestore
      await userRef.update({
        subscriptionStatus: 'cancelled',
        cancelledAt: new Date().toISOString()
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Subscription cancelled successfully' 
      });
      
    } catch (apiError) {
      console.error('Error calling Lemon Squeezy API:', apiError);
      throw apiError;
    }
    
  } catch (error) {
    console.error('🔥 Error cancelling subscription:', error);
    return res.status(500).json({
      error: 'Failed to cancel subscription',
      details: error.response?.data || error.message || 'Unknown error',
    });
  }
}

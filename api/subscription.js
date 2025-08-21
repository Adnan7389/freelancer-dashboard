import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../src/firebase';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify user is authenticated
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user document
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    
    // Return relevant subscription data
    const subscriptionData = {
      status: userData.subscriptionStatus || 'inactive',
      plan: userData.plan || 'Free',
      renewsAt: userData.renewsAt?.toDate?.() || null,
      endsAt: userData.subscriptionEndsAt?.toDate?.() || null,
      willCancelAtPeriodEnd: userData.willCancelAtPeriodEnd || false,
      subscriptionId: userData.subscriptionId || null,
      subscriptionUrl: userData.subscriptionUrl || null,
      createdAt: userData.createdAt?.toDate?.() || null,
      updatedAt: userData.updatedAt?.toDate?.() || null
    };

    return res.status(200).json(subscriptionData);

  } catch (error) {
    console.error('Error fetching subscription data:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch subscription data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

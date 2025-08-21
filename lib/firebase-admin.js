import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin only once
const apps = getApps();
let admin = {};

if (!apps.length) {
  try {
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8')
    );

    admin.app = initializeApp({
      credential: cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });

    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    throw error;
  }
} else {
  admin.app = apps[0];
}

// Initialize services
export const db = getFirestore(admin.app);
export const auth = getAuth(admin.app);
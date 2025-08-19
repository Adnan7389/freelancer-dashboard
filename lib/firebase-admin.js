import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString()
  );
  
  initializeApp({
    credential: cert(serviceAccount)
  });
}

export const db = getFirestore();
export { getAuth } from 'firebase-admin/auth';

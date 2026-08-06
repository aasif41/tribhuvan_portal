import admin from 'firebase-admin';
import { env } from './env';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

export const firebaseAdmin = admin;
export const firebaseAuth = admin.auth();

export default firebaseAdmin;

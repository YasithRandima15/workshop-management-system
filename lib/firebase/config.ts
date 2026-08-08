import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

function cleanEnv(val?: string): string {
  if (!val) return '';
  return val.replace(/^["']|["']$/g, '').trim();
}

const firebaseConfig = {
  apiKey: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) || 'demo-api-key',
  authDomain: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) || 'demo-workshop.firebaseapp.com',
  projectId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) || 'demo-workshop',
  storageBucket: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) || 'demo-workshop.appspot.com',
  messagingSenderId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) || '123456789',
  appId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID) || '1:123456789:web:abcdef',
};

// Check if Firebase environment variables are configured with actual keys
export function isFirebaseConfigured(): boolean {
  const key = cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  const proj = cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  return Boolean(key && proj && key !== 'demo-api-key');
}

// Timeout helper to ensure network requests never hang infinitely
export function withTimeout<T>(promise: Promise<T>, ms = 4000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Firebase connection timed out. Check Security Rules & Auth Domains.')), ms)
    ),
  ]);
}

// Initialize Firebase App singleton safely
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAEDhD1Tlpbygx1-jeDjoAZdNgXClhCzHE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'vulmora-b26f8.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'vulmora-b26f8',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'vulmora-b26f8.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '294098105741',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:294098105741:web:5ecc144e41e7614e8c39c4',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-SKP8SJWFZ3',
};

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

// Initialize Firebase app once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics conditionally (supported in browser environments)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics blocked or unavailable
    });
}

export { analytics };
export default app;

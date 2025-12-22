import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

// Validate Firebase credentials
const hasCredentials = Object.values(firebaseConfig).every(
  (value) => value !== undefined && value !== ''
);

let database: ReturnType<typeof getDatabase> | null = null;

if (hasCredentials) {
  try {
    const app = initializeApp(firebaseConfig);
    database = getDatabase(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
    console.warn('⚠️ Firebase is disabled. Counter functionality will not work.');
  }
} else {
  console.warn('⚠️ Firebase credentials missing. Counter functionality will be disabled.');
}

export { database };

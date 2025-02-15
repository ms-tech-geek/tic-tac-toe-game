import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  type Auth,
  type Firestore 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Create a type for our Firebase services
interface FirebaseServices {
  app: ReturnType<typeof initializeApp>;
  auth: Auth;
  db: Firestore;
  googleProvider: GoogleAuthProvider;
}

// Validate required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID'
] as const;

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    console.error(`Firebase config error: ${envVar} is not defined`);
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

console.log('Firebase config validation passed');

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase services
const initializeFirebase = (): FirebaseServices => {
  try {
    const app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');

    const auth = getAuth(app);
    const db = getFirestore(app);
    const googleProvider = new GoogleAuthProvider();

    // Configure Google provider
    googleProvider.setCustomParameters({
      prompt: 'select_account',
      // Add COOP settings to handle the warning
      auth_type: 'rerequest',
      access_type: 'offline'
    });

    // Set up auth state listener
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Auth state changed: User is signed in', {
          uid: user.uid,
          email: user.email,
          provider: user.providerData[0]?.providerId
        });
      } else {
        console.log('Auth state changed: User is signed out');
      }
    });

    console.log('Firebase services initialized');
    return { app, auth, db, googleProvider };
  } catch (error: any) {
    if (!/already exists/.test(error.message)) {
      console.error('Firebase initialization error:', error.stack);
    }
    throw error;
  }
};

// Initialize and export Firebase services
const { app, auth, db, googleProvider } = initializeFirebase();

export { app, auth, db, googleProvider };
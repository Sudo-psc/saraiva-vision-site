/**
 * Firebase Configuration and Initialization
 *
 * This file initializes Firebase with the necessary configuration
 * for authentication services. The configuration is loaded from
 * environment variables to ensure security.
 *
 * @module firebase
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

/**
 * Firebase configuration object
 * All values are loaded from environment variables for security
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Validate that all required Firebase environment variables are present
 * @throws {Error} If any required environment variable is missing
 */
function validateFirebaseConfig() {
  const requiredKeys = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  const missing = requiredKeys.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all Firebase variables are set.'
    );
  }
}

// Validate configuration before initializing
if (import.meta.env.MODE !== 'test') {
  validateFirebaseConfig();
}

/**
 * Initialize Firebase app
 * @type {FirebaseApp}
 */
export const app = initializeApp(firebaseConfig);

/**
 * Get Firebase Auth instance
 * @type {Auth}
 */
export const auth = getAuth(app);

/**
 * Check if Firebase is properly initialized
 * @returns {boolean} True if Firebase is initialized
 */
export function isFirebaseInitialized() {
  try {
    return !!app && !!auth;
  } catch (error) {
    console.error('Firebase initialization check failed:', error);
    return false;
  }
}

export default app;

/**
 * Firebase Authentication Service
 *
 * Provides authentication services using Firebase Auth with Google Sign-In.
 * Handles user authentication, session management, and token operations.
 *
 * @module firebaseAuth
 */

import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

/**
 * Google Auth Provider instance
 */
const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account', // Always show account selection
});

/**
 * Sign in with Google using popup
 * @returns {Promise<{user: Object, token: string}>} User object and ID token
 * @throws {Error} If sign-in fails
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const token = await user.getIdToken();

    return {
      user: serializeUser(user),
      token,
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw handleAuthError(error);
  }
}

/**
 * Sign in with Google using redirect (better for mobile)
 * Call this to initiate redirect, then call getRedirectResult() after redirect
 * @returns {Promise<void>}
 */
export async function signInWithGoogleRedirect() {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error('Error initiating Google redirect:', error);
    throw handleAuthError(error);
  }
}

/**
 * Get result from Google redirect sign-in
 * Should be called on page load after redirect
 * @returns {Promise<{user: Object, token: string} | null>} User object and token, or null if no redirect
 */
export async function handleGoogleRedirect() {
  try {
    const result = await getRedirectResult(auth);
    if (!result) {
      return null;
    }

    const user = result.user;
    const token = await user.getIdToken();

    return {
      user: serializeUser(user),
      token,
    };
  } catch (error) {
    console.error('Error handling Google redirect:', error);
    throw handleAuthError(error);
  }
}

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user: Object, token: string}>} User object and ID token
 * @throws {Error} If sign-in fails
 */
export async function signInWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    const token = await user.getIdToken();

    return {
      user: serializeUser(user),
      token,
    };
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw handleAuthError(error);
  }
}

/**
 * Create new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - User display name (optional)
 * @returns {Promise<{user: Object, token: string}>} User object and ID token
 * @throws {Error} If registration fails
 */
export async function signUpWithEmail(email, password, displayName = null) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // Update profile with display name if provided
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    const token = await user.getIdToken();

    return {
      user: serializeUser(user),
      token,
    };
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw handleAuthError(error);
  }
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<void>}
 * @throws {Error} If reset email fails
 */
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw handleAuthError(error);
  }
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 * @throws {Error} If sign-out fails
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw handleAuthError(error);
  }
}

/**
 * Get current authenticated user
 * @returns {Object | null} Serialized user object or null if not authenticated
 */
export function getCurrentUser() {
  const user = auth.currentUser;
  return user ? serializeUser(user) : null;
}

/**
 * Get current user's ID token
 * @param {boolean} forceRefresh - Force token refresh
 * @returns {Promise<string | null>} ID token or null if not authenticated
 */
export async function getIdToken(forceRefresh = false) {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    return await user.getIdToken(forceRefresh);
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
}

/**
 * Subscribe to authentication state changes
 * @param {Function} callback - Callback function receiving serialized user or null
 * @returns {Function} Unsubscribe function
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user ? serializeUser(user) : null);
  });
}

/**
 * Update user profile
 * @param {Object} updates - Profile updates (displayName, photoURL)
 * @returns {Promise<Object>} Updated user object
 * @throws {Error} If update fails
 */
export async function updateUserProfile(updates) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    await updateProfile(user, updates);
    return serializeUser(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    throw handleAuthError(error);
  }
}

/**
 * Update user email
 * @param {string} newEmail - New email address
 * @returns {Promise<Object>} Updated user object
 * @throws {Error} If update fails
 */
export async function updateUserEmail(newEmail) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    await updateEmail(user, newEmail);
    return serializeUser(user);
  } catch (error) {
    console.error('Error updating email:', error);
    throw handleAuthError(error);
  }
}

/**
 * Update user password
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 * @throws {Error} If update fails
 */
export async function updateUserPassword(newPassword) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('Error updating password:', error);
    throw handleAuthError(error);
  }
}

/**
 * Reauthenticate user with email and password
 * Required before sensitive operations like changing email/password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<void>}
 * @throws {Error} If reauthentication fails
 */
export async function reauthenticateUser(email, password) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential);
  } catch (error) {
    console.error('Error reauthenticating user:', error);
    throw handleAuthError(error);
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export function isAuthenticated() {
  return !!auth.currentUser;
}

/**
 * Wait for authentication state to initialize
 * Useful for checking auth state on app load
 * @param {number} timeout - Timeout in milliseconds (default 5000)
 * @returns {Promise<Object | null>} User object or null
 */
export function waitForAuthInit(timeout = 5000) {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user ? serializeUser(user) : null);
      },
      reject
    );

    // Timeout fallback
    setTimeout(() => {
      unsubscribe();
      resolve(null);
    }, timeout);
  });
}

/**
 * Serialize Firebase user to plain object
 * Removes circular references and extracts essential data
 * @param {Object} user - Firebase user object
 * @returns {Object} Serialized user object
 */
function serializeUser(user) {
  if (!user) return null;

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    phoneNumber: user.phoneNumber,
    metadata: {
      creationTime: user.metadata.creationTime,
      lastSignInTime: user.metadata.lastSignInTime,
    },
    providerData: user.providerData.map((provider) => ({
      providerId: provider.providerId,
      uid: provider.uid,
      displayName: provider.displayName,
      email: provider.email,
      photoURL: provider.photoURL,
    })),
  };
}

/**
 * Handle Firebase auth errors
 * Converts Firebase errors to user-friendly messages
 * @param {Error} error - Firebase error object
 * @returns {Error} Error with user-friendly message
 */
function handleAuthError(error) {
  const errorMessages = {
    'auth/user-not-found': 'Usuário não encontrado.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/email-already-in-use': 'Este email já está em uso.',
    'auth/weak-password': 'A senha é muito fraca. Use pelo menos 6 caracteres.',
    'auth/invalid-email': 'Email inválido.',
    'auth/user-disabled': 'Esta conta foi desativada.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    'auth/network-request-failed': 'Erro de rede. Verifique sua conexão.',
    'auth/popup-closed-by-user': 'Popup fechado antes de completar o login.',
    'auth/cancelled-popup-request': 'Operação cancelada.',
    'auth/popup-blocked': 'Popup bloqueado pelo navegador. Permita popups para este site.',
    'auth/requires-recent-login': 'Por segurança, faça login novamente.',
  };

  const message = errorMessages[error.code] || error.message || 'Erro desconhecido ao autenticar.';

  const customError = new Error(message);
  customError.code = error.code;
  customError.originalError = error;

  return customError;
}

export default {
  signInWithGoogle,
  signInWithGoogleRedirect,
  handleGoogleRedirect,
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
  signOut,
  getCurrentUser,
  getIdToken,
  onAuthChange,
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
  reauthenticateUser,
  isAuthenticated,
  waitForAuthInit,
};

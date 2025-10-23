/**
 * Authentication Context
 *
 * Provides global authentication state and methods to the application.
 * Manages user session, Firebase authentication, and subscriber data sync.
 *
 * @module AuthContext
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'prop-types';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOut as firebaseSignOut,
  onAuthChange,
  getCurrentUser,
  getIdToken,
  waitForAuthInit,
  updateUserProfile as firebaseUpdateProfile,
  resetPassword as firebaseResetPassword,
} from '../services/firebaseAuth';

/**
 * Authentication Context
 */
const AuthContext = createContext(null);

/**
 * Storage keys for persistence
 */
const STORAGE_KEYS = {
  USER: 'saraiva_auth_user',
  SUBSCRIBER: 'saraiva_auth_subscriber',
  TOKEN: 'saraiva_auth_token',
  TOKEN_EXPIRY: 'saraiva_auth_token_expiry',
};

/**
 * Token expiry time (55 minutes - Firebase tokens expire after 1 hour)
 */
const TOKEN_EXPIRY_TIME = 55 * 60 * 1000; // 55 minutes in milliseconds

/**
 * Authentication Provider Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [subscriber, setSubscriber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  /**
   * Load user data from localStorage on mount
   */
  useEffect(() => {
    const loadPersistedAuth = async () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const storedSubscriber = localStorage.getItem(STORAGE_KEYS.SUBSCRIBER);
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedTokenExpiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

        // Check if token is expired
        if (storedToken && storedTokenExpiry) {
          const expiry = parseInt(storedTokenExpiry, 10);
          if (Date.now() < expiry) {
            setToken(storedToken);
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            }
            if (storedSubscriber) {
              setSubscriber(JSON.parse(storedSubscriber));
            }
          } else {
            // Token expired, clear storage
            clearPersistedAuth();
          }
        }

        // Wait for Firebase auth to initialize
        const firebaseUser = await waitForAuthInit();
        if (firebaseUser) {
          setUser(firebaseUser);
          persistUser(firebaseUser);

          // Get fresh token
          const freshToken = await getIdToken(true);
          if (freshToken) {
            setToken(freshToken);
            persistToken(freshToken);
          }

          // Sync subscriber data from backend
          await syncSubscriberData(firebaseUser.uid, freshToken);
        }
      } catch (error) {
        console.error('Error loading persisted auth:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    loadPersistedAuth();
  }, []);

  /**
   * Subscribe to auth state changes
   */
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        persistUser(firebaseUser);

        // Get token
        const freshToken = await getIdToken();
        if (freshToken) {
          setToken(freshToken);
          persistToken(freshToken);

          // Sync subscriber data
          await syncSubscriberData(firebaseUser.uid, freshToken);
        }
      } else {
        handleSignOut();
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Sync subscriber data from backend
   * @param {string} firebaseUid - Firebase user UID
   * @param {string} authToken - Auth token
   */
  const syncSubscriberData = async (firebaseUid, authToken) => {
    try {
      const response = await fetch(`/api/subscribers/profile/${firebaseUid}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriber(data.subscriber);
        persistSubscriber(data.subscriber);
      } else if (response.status === 404) {
        // Subscriber doesn't exist, create one
        await createSubscriberRecord(firebaseUid, authToken);
      }
    } catch (error) {
      console.error('Error syncing subscriber data:', error);
    }
  };

  /**
   * Create subscriber record in backend
   * @param {string} firebaseUid - Firebase user UID
   * @param {string} authToken - Auth token
   */
  const createSubscriberRecord = async (firebaseUid, authToken) => {
    try {
      const response = await fetch('/api/subscribers/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ firebaseToken: authToken }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriber(data.subscriber);
        persistSubscriber(data.subscriber);
      }
    } catch (error) {
      console.error('Error creating subscriber record:', error);
    }
  };

  /**
   * Sign in with Google
   */
  const signInWithGoogleProvider = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { user: firebaseUser, token: authToken } = await signInWithGoogle();
      setUser(firebaseUser);
      setToken(authToken);

      persistUser(firebaseUser);
      persistToken(authToken);

      // Sync subscriber data
      await syncSubscriberData(firebaseUser.uid, authToken);

      return { success: true, user: firebaseUser };
    } catch (error) {
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   */
  const signInWithEmailProvider = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const { user: firebaseUser, token: authToken } = await signInWithEmail(email, password);
      setUser(firebaseUser);
      setToken(authToken);

      persistUser(firebaseUser);
      persistToken(authToken);

      // Sync subscriber data
      await syncSubscriberData(firebaseUser.uid, authToken);

      return { success: true, user: firebaseUser };
    } catch (error) {
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign up with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} displayName - User display name
   */
  const signUp = useCallback(async (email, password, displayName) => {
    try {
      setLoading(true);
      setError(null);

      const { user: firebaseUser, token: authToken } = await signUpWithEmail(email, password, displayName);
      setUser(firebaseUser);
      setToken(authToken);

      persistUser(firebaseUser);
      persistToken(authToken);

      // Create subscriber record
      await createSubscriberRecord(firebaseUser.uid, authToken);

      return { success: true, user: firebaseUser };
    } catch (error) {
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await firebaseSignOut();
      handleSignOut();

      return { success: true };
    } catch (error) {
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset password
   * @param {string} email - User email
   */
  const resetPassword = useCallback(async (email) => {
    try {
      setLoading(true);
      setError(null);

      await firebaseResetPassword(email);

      return { success: true };
    } catch (error) {
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update user profile
   * @param {Object} updates - Profile updates
   */
  const updateProfile = useCallback(async (updates) => {
    try {
      setLoading(true);
      setError(null);

      // Update Firebase profile
      const updatedUser = await firebaseUpdateProfile(updates);
      setUser(updatedUser);
      persistUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update subscriber data
   * @param {Object} updates - Subscriber updates
   */
  const updateSubscriberData = useCallback(async (updates) => {
    try {
      setLoading(true);
      setError(null);

      if (!user || !token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`/api/subscribers/profile/${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscriber data');
      }

      const data = await response.json();
      setSubscriber(data.subscriber);
      persistSubscriber(data.subscriber);

      return { success: true, subscriber: data.subscriber };
    } catch (error) {
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  /**
   * Refresh authentication token
   */
  const refreshToken = useCallback(async () => {
    try {
      const freshToken = await getIdToken(true);
      if (freshToken) {
        setToken(freshToken);
        persistToken(freshToken);
        return freshToken;
      }
      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }, []);

  /**
   * Handle sign out (clear state and storage)
   */
  const handleSignOut = () => {
    setUser(null);
    setSubscriber(null);
    setToken(null);
    clearPersistedAuth();
  };

  /**
   * Persist user to localStorage
   * @param {Object} userData - User data
   */
  const persistUser = (userData) => {
    if (userData) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    }
  };

  /**
   * Persist subscriber to localStorage
   * @param {Object} subscriberData - Subscriber data
   */
  const persistSubscriber = (subscriberData) => {
    if (subscriberData) {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIBER, JSON.stringify(subscriberData));
    }
  };

  /**
   * Persist token to localStorage with expiry
   * @param {string} authToken - Auth token
   */
  const persistToken = (authToken) => {
    if (authToken) {
      const expiry = Date.now() + TOKEN_EXPIRY_TIME;
      localStorage.setItem(STORAGE_KEYS.TOKEN, authToken);
      localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiry.toString());
    }
  };

  /**
   * Clear persisted authentication data
   */
  const clearPersistedAuth = () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  };

  /**
   * Context value
   */
  const value = {
    user,
    subscriber,
    loading,
    error,
    token,
    isAuthenticated: !!user,
    signInWithGoogle: signInWithGoogleProvider,
    signInWithEmail: signInWithEmailProvider,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    updateSubscriberData,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: React.PropTypes.node.isRequired,
};

/**
 * Hook to use authentication context
 * @returns {Object} Authentication context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

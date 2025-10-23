/**
 * Firebase Authentication Service Tests
 *
 * Unit tests for Firebase authentication service.
 * Tests all authentication methods and error handling.
 *
 * @jest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as firebaseAuth from '../services/firebaseAuth';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(),
  getRedirectResult: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
  updateEmail: vi.fn(),
  updatePassword: vi.fn(),
  reauthenticateWithCredential: vi.fn(),
  EmailAuthProvider: {
    credential: vi.fn(),
  },
  getAuth: vi.fn(() => ({
    currentUser: null,
  })),
}));

// Mock Firebase app
vi.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
  app: {},
}));

describe('Firebase Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('signInWithGoogle', () => {
    it('should sign in with Google successfully', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        emailVerified: true,
        phoneNumber: null,
        metadata: {
          creationTime: '2024-01-01T00:00:00Z',
          lastSignInTime: '2024-01-01T00:00:00Z',
        },
        providerData: [],
        getIdToken: vi.fn().mockResolvedValue('mock-token'),
      };

      const { signInWithPopup } = await import('firebase/auth');
      signInWithPopup.mockResolvedValue({ user: mockUser });

      const result = await firebaseAuth.signInWithGoogle();

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.uid).toBe('test-uid');
      expect(result.token).toBe('mock-token');
    });

    it('should handle sign-in errors', async () => {
      const { signInWithPopup } = await import('firebase/auth');
      const mockError = new Error('Sign-in failed');
      mockError.code = 'auth/popup-closed-by-user';
      signInWithPopup.mockRejectedValue(mockError);

      await expect(firebaseAuth.signInWithGoogle()).rejects.toThrow();
    });
  });

  describe('signInWithEmail', () => {
    it('should sign in with email and password successfully', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        emailVerified: false,
        phoneNumber: null,
        metadata: {
          creationTime: '2024-01-01T00:00:00Z',
          lastSignInTime: '2024-01-01T00:00:00Z',
        },
        providerData: [],
        getIdToken: vi.fn().mockResolvedValue('mock-token'),
      };

      const { signInWithEmailAndPassword } = await import('firebase/auth');
      signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

      const result = await firebaseAuth.signInWithEmail('test@example.com', 'password123');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should handle invalid credentials', async () => {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const mockError = new Error('Invalid credentials');
      mockError.code = 'auth/wrong-password';
      signInWithEmailAndPassword.mockRejectedValue(mockError);

      await expect(
        firebaseAuth.signInWithEmail('test@example.com', 'wrongpassword')
      ).rejects.toThrow();
    });
  });

  describe('signUpWithEmail', () => {
    it('should create new user successfully', async () => {
      const mockUser = {
        uid: 'new-uid',
        email: 'new@example.com',
        displayName: 'New User',
        photoURL: null,
        emailVerified: false,
        phoneNumber: null,
        metadata: {
          creationTime: '2024-01-01T00:00:00Z',
          lastSignInTime: '2024-01-01T00:00:00Z',
        },
        providerData: [],
        getIdToken: vi.fn().mockResolvedValue('mock-token'),
      };

      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
      updateProfile.mockResolvedValue();

      const result = await firebaseAuth.signUpWithEmail(
        'new@example.com',
        'password123',
        'New User'
      );

      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('new@example.com');
      expect(updateProfile).toHaveBeenCalled();
    });

    it('should handle email already in use error', async () => {
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const mockError = new Error('Email already in use');
      mockError.code = 'auth/email-already-in-use';
      createUserWithEmailAndPassword.mockRejectedValue(mockError);

      await expect(
        firebaseAuth.signUpWithEmail('existing@example.com', 'password123')
      ).rejects.toThrow();
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email successfully', async () => {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      sendPasswordResetEmail.mockResolvedValue();

      await expect(firebaseAuth.resetPassword('test@example.com')).resolves.not.toThrow();
      expect(sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('should handle invalid email error', async () => {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      const mockError = new Error('Invalid email');
      mockError.code = 'auth/invalid-email';
      sendPasswordResetEmail.mockRejectedValue(mockError);

      await expect(firebaseAuth.resetPassword('invalid-email')).rejects.toThrow();
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      const { signOut } = await import('firebase/auth');
      signOut.mockResolvedValue();

      await expect(firebaseAuth.signOut()).resolves.not.toThrow();
      expect(signOut).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no user is authenticated', () => {
      const result = firebaseAuth.getCurrentUser();
      expect(result).toBeNull();
    });

    it('should return serialized user when authenticated', async () => {
      const mockAuth = await import('@/lib/firebase');
      mockAuth.auth.currentUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        emailVerified: true,
        phoneNumber: null,
        metadata: {
          creationTime: '2024-01-01T00:00:00Z',
          lastSignInTime: '2024-01-01T00:00:00Z',
        },
        providerData: [],
      };

      const result = firebaseAuth.getCurrentUser();
      expect(result).toHaveProperty('uid', 'test-uid');
      expect(result).toHaveProperty('email', 'test@example.com');

      // Cleanup
      mockAuth.auth.currentUser = null;
    });
  });

  describe('getIdToken', () => {
    it('should return null when no user is authenticated', async () => {
      const result = await firebaseAuth.getIdToken();
      expect(result).toBeNull();
    });

    it('should return token when user is authenticated', async () => {
      const mockAuth = await import('@/lib/firebase');
      mockAuth.auth.currentUser = {
        getIdToken: vi.fn().mockResolvedValue('mock-token'),
      };

      const result = await firebaseAuth.getIdToken();
      expect(result).toBe('mock-token');

      // Cleanup
      mockAuth.auth.currentUser = null;
    });

    it('should force refresh token when requested', async () => {
      const mockAuth = await import('@/lib/firebase');
      const getIdTokenMock = vi.fn().mockResolvedValue('refreshed-token');
      mockAuth.auth.currentUser = {
        getIdToken: getIdTokenMock,
      };

      await firebaseAuth.getIdToken(true);
      expect(getIdTokenMock).toHaveBeenCalledWith(true);

      // Cleanup
      mockAuth.auth.currentUser = null;
    });
  });

  describe('onAuthChange', () => {
    it('should subscribe to auth state changes', () => {
      const { onAuthStateChanged } = await import('firebase/auth');
      const callback = vi.fn();
      const unsubscribe = vi.fn();
      onAuthStateChanged.mockReturnValue(unsubscribe);

      const result = firebaseAuth.onAuthChange(callback);

      expect(onAuthStateChanged).toHaveBeenCalled();
      expect(result).toBe(unsubscribe);
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no user is authenticated', () => {
      expect(firebaseAuth.isAuthenticated()).toBe(false);
    });

    it('should return true when user is authenticated', async () => {
      const mockAuth = await import('@/lib/firebase');
      mockAuth.auth.currentUser = {
        uid: 'test-uid',
      };

      expect(firebaseAuth.isAuthenticated()).toBe(true);

      // Cleanup
      mockAuth.auth.currentUser = null;
    });
  });

  describe('waitForAuthInit', () => {
    it('should resolve with user when authenticated', async () => {
      const { onAuthStateChanged } = await import('firebase/auth');
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        emailVerified: false,
        phoneNumber: null,
        metadata: {
          creationTime: '2024-01-01T00:00:00Z',
          lastSignInTime: '2024-01-01T00:00:00Z',
        },
        providerData: [],
      };

      onAuthStateChanged.mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockUser), 0);
        return vi.fn();
      });

      const result = await firebaseAuth.waitForAuthInit();
      expect(result).toHaveProperty('uid', 'test-uid');
    });

    it('should resolve with null on timeout', async () => {
      const { onAuthStateChanged } = await import('firebase/auth');
      onAuthStateChanged.mockImplementation(() => vi.fn());

      const result = await firebaseAuth.waitForAuthInit(100);
      expect(result).toBeNull();
    }, 10000); // Extended timeout for test
  });

  describe('Error handling', () => {
    it('should convert Firebase errors to user-friendly messages', async () => {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const mockError = new Error('Firebase error');
      mockError.code = 'auth/user-not-found';
      signInWithEmailAndPassword.mockRejectedValue(mockError);

      try {
        await firebaseAuth.signInWithEmail('test@example.com', 'password');
      } catch (error) {
        expect(error.message).toContain('Usuário não encontrado');
      }
    });

    it('should handle unknown errors gracefully', async () => {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const mockError = new Error('Unknown error');
      mockError.code = 'auth/unknown-error';
      signInWithEmailAndPassword.mockRejectedValue(mockError);

      await expect(
        firebaseAuth.signInWithEmail('test@example.com', 'password')
      ).rejects.toThrow();
    });
  });
});

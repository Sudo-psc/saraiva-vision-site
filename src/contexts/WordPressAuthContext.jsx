/**
 * WordPress JWT Authentication Context
 * Manages WordPress JWT authentication state and provides authentication services
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import WordPressJWTAuthService from '../services/WordPressJWTAuthService';
import { tokenStorage, logger } from '../lib/wordpress-jwt-utils';

const WordPressAuthContext = createContext({});

export const useWordPressAuth = () => {
    const context = useContext(WordPressAuthContext);
    if (!context) {
        throw new Error('useWordPressAuth must be used within a WordPressAuthProvider');
    }
    return context;
};

export const WordPressAuthProvider = ({ children }) => {
    const [jwtService] = useState(() => new WordPressJWTAuthService());
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [wordpressUser, setWordpressUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authStatus, setAuthStatus] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        initializeWordPressAuth();
    }, []);

    const initializeWordPressAuth = async () => {
        try {
            setLoading(true);
            setError(null);

            // Try to restore authentication from stored token
            const restored = jwtService.initializeFromStorage();

            if (restored) {
                // Validate the restored token
                const isValid = await jwtService.validateToken();

                if (isValid) {
                    setIsAuthenticated(true);

                    // Get current user information
                    try {
                        const user = await jwtService.getCurrentUser();
                        setWordpressUser(user);
                        logger.auth('WordPress authentication restored', {
                            user: user?.username,
                            expires: new Date(jwtService.tokenExpiry).toISOString()
                        });
                    } catch (userError) {
                        logger.error('Failed to get WordPress user after restoration', userError);
                        // Token is valid but user fetch failed - still consider authenticated
                    }
                } else {
                    // Token is invalid, clear storage
                    jwtService.clearAuth();
                    tokenStorage.clearAllTokens();
                }
            }

            // Get initial authentication status
            const status = jwtService.getAuthStatus();
            setAuthStatus(status);

        } catch (err) {
            console.error('Error initializing WordPress authentication:', err);
            setError(err.message);
            // Clear any potentially corrupted auth state
            jwtService.clearAuth();
            tokenStorage.clearAllTokens();
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            setLoading(true);
            setError(null);

            // Authenticate with WordPress
            const token = await jwtService.authenticate();

            // Get user information
            const user = await jwtService.getCurrentUser();

            setIsAuthenticated(true);
            setWordpressUser(user);

            // Update auth status
            const status = jwtService.getAuthStatus();
            setAuthStatus(status);

            logger.auth('WordPress login successful', {
                user: user.username,
                expires: new Date(jwtService.tokenExpiry).toISOString()
            });

            return { success: true, user, token };

        } catch (err) {
            console.error('WordPress login error:', err);
            setError(err.message);
            setIsAuthenticated(false);
            setWordpressUser(null);

            return {
                success: false,
                error: err.message,
                code: err.code || 'LOGIN_FAILED'
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);

            // Clear WordPress authentication
            await jwtService.logout();

            setIsAuthenticated(false);
            setWordpressUser(null);
            setAuthStatus(null);
            setError(null);

            logger.auth('WordPress logout successful');

        } catch (err) {
            console.error('WordPress logout error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const refreshToken = async () => {
        try {
            setLoading(true);
            setError(null);

            const newToken = await jwtService.refreshToken();

            // Update user information with new token
            try {
                const user = await jwtService.getCurrentUser();
                setWordpressUser(user);
            } catch (userError) {
                logger.error('Failed to get user after token refresh', userError);
            }

            // Update auth status
            const status = jwtService.getAuthStatus();
            setAuthStatus(status);

            logger.auth('WordPress token refreshed successfully');

            return { success: true, token: newToken };

        } catch (err) {
            console.error('WordPress token refresh error:', err);
            setError(err.message);

            // If refresh fails, logout the user
            await logout();

            return {
                success: false,
                error: err.message,
                code: 'TOKEN_REFRESH_FAILED'
            };
        } finally {
            setLoading(false);
        }
    };

    const testConnection = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await jwtService.testConnection();

            // Update auth status after test
            const status = jwtService.getAuthStatus();
            setAuthStatus(status);

            // Update authentication state based on test result
            if (result.success) {
                setIsAuthenticated(true);
                setWordpressUser(result.user);
            }

            return result;

        } catch (err) {
            console.error('WordPress connection test error:', err);
            setError(err.message);

            return {
                success: false,
                error: err.message,
                authStatus: jwtService.getAuthStatus()
            };
        } finally {
            setLoading(false);
        }
    };

    const checkAuthStatus = () => {
        const status = jwtService.getAuthStatus();
        setAuthStatus(status);
        return status;
    };

    // Helper functions for common WordPress permissions
    const canEditPosts = () => {
        return wordpressUser?.capabilities?.includes('edit_posts') || false;
    };

    const canPublishPosts = () => {
        return wordpressUser?.capabilities?.includes('publish_posts') || false;
    };

    const canManageCategories = () => {
        return wordpressUser?.capabilities?.includes('manage_categories') || false;
    };

    const canUploadFiles = () => {
        return wordpressUser?.capabilities?.includes('upload_files') || false;
    };

    const getTokenTimeRemaining = () => {
        if (!authStatus?.tokenExpiry) return null;
        return Math.max(0, authStatus.tokenExpiry - Date.now());
    };

    const isTokenExpiringSoon = (thresholdMs = 5 * 60 * 1000) => { // 5 minutes
        const timeRemaining = getTokenTimeRemaining();
        return timeRemaining !== null && timeRemaining <= thresholdMs;
    };

    const value = {
        // State
        isAuthenticated,
        wordpressUser,
        loading,
        authStatus,
        error,

        // Methods
        login,
        logout,
        refreshToken,
        testConnection,
        checkAuthStatus,

        // Helpers
        canEditPosts,
        canPublishPosts,
        canManageCategories,
        canUploadFiles,
        getTokenTimeRemaining,
        isTokenExpiringSoon,

        // JWT Service for advanced usage
        jwtService
    };

    return (
        <WordPressAuthContext.Provider value={value}>
            {children}
        </WordPressAuthContext.Provider>
    );
};

export default WordPressAuthContext;
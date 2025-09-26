import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.ts';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);

    useEffect(() => {
        // Check if supabase client is available and properly configured
        if (!supabase || typeof supabase.auth?.getSession !== 'function') {
            console.warn('Supabase client not available or not properly configured. Authentication will not work.');
            setLoading(false);
            return;
        }

        let mounted = true;

        // Get initial session
        const getInitialSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Error getting session:', error);
                    if (mounted) {
                        setSession(null);
                        setUser(null);
                        setProfile(null);
                    }
                    return;
                }

                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        await fetchUserProfile(session.user.id);
                    } else {
                        setProfile(null);
                    }
                }
            } catch (error) {
                console.error('Error in getInitialSession:', error);
                if (mounted) {
                    setSession(null);
                    setUser(null);
                    setProfile(null);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        getInitialSession();

        // Listen for auth changes
        let subscription = null;
        try {
            const authSubscription = supabase.auth.onAuthStateChange(
                async (event, session) => {
                    console.log('Auth state changed:', event, session?.user?.email);

                    if (mounted) {
                        setSession(session);
                        setUser(session?.user ?? null);

                        if (session?.user) {
                            await fetchUserProfile(session.user.id);
                        } else {
                            setProfile(null);
                        }

                        setLoading(false);
                    }
                }
            );
            subscription = authSubscription.data?.subscription;
        } catch (error) {
            console.error('Error setting up auth state change listener:', error);
            if (mounted) {
                setLoading(false);
            }
        }

        return () => {
            mounted = false;
            if (subscription?.unsubscribe) {
                subscription.unsubscribe();
            }
        };
    }, []);

    const fetchUserProfile = async (userId) => {
        if (!supabase || typeof supabase.from !== 'function') {
            console.warn('Supabase client not available for profile fetch');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return;
            }

            setProfile(data);
        } catch (error) {
            console.error('Error in fetchUserProfile:', error);
        }
    };

    const signIn = async (email, password) => {
        if (!supabase) {
            const error = new Error('Supabase client not available');
            console.error('Sign in error:', error);
            return { data: null, error };
        }

        try {
            setLoading(true);

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password
            });

            if (error) {
                throw error;
            }

            return { data, error: null };
        } catch (error) {
            console.error('Sign in error:', error);
            return { data: null, error };
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        if (!supabase) {
            const error = new Error('Supabase client not available');
            console.error('Sign out error:', error);
            return { error };
        }

        try {
            setLoading(true);

            const { error } = await supabase.auth.signOut();

            if (error) {
                throw error;
            }

            setUser(null);
            setProfile(null);
            setSession(null);

            return { error: null };
        } catch (error) {
            console.error('Sign out error:', error);
            return { error };
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates) => {
        if (!supabase) {
            const error = new Error('Supabase client not available');
            console.error('Update profile error:', error);
            return { data: null, error };
        }

        try {
            if (!user) {
                throw new Error('No user logged in');
            }

            const { data, error } = await supabase
                .from('profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)
                .select()
                .single();

            if (error) {
                throw error;
            }

            setProfile(data);
            return { data, error: null };
        } catch (error) {
            console.error('Update profile error:', error);
            return { data: null, error };
        }
    };

    // Role-based access control helpers
    const isAdmin = () => {
        return profile?.role === 'admin' || profile?.role === 'super_admin';
    };

    const isSuperAdmin = () => {
        return profile?.role === 'super_admin';
    };

    const hasRole = (requiredRole) => {
        if (!profile) return false;

        const roleHierarchy = {
            'user': 1,
            'admin': 2,
            'super_admin': 3
        };

        const userLevel = roleHierarchy[profile.role] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;

        return userLevel >= requiredLevel;
    };

    const canAccessDashboard = () => {
        return isAdmin() && profile?.is_active;
    };

    const value = {
        user,
        profile,
        session,
        loading,
        signIn,
        signOut,
        updateProfile,
        isAdmin,
        isSuperAdmin,
        hasRole,
        canAccessDashboard,
        isAuthenticated: !!user,
        isProfileLoaded: !!profile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
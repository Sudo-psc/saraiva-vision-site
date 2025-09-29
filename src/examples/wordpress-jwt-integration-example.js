/**
 * WordPress JWT Integration Example
 * Demonstrates how to use the enhanced WordPressBlogService with JWT authentication
 */

import WordPressBlogService from '../services/WordPressBlogService.js';
import WordPressJWTAuthService from '../services/WordPressJWTAuthService.js';
import { logger, formatTimeRemaining } from '../lib/wordpress-jwt-utils.js';

// Example 1: Basic usage with JWT authentication
async function basicJWTExample() {
    console.log('=== Basic JWT Authentication Example ===\n');

    // Initialize service with JWT authentication enabled
    const blogService = new WordPressBlogService({
        useJWTAuth: true,
        cmsBaseURL: 'https://cms.saraivavision.com.br',
        jwtCredentials: {
            username: 'your_wordpress_username',
            password: 'your_wordpress_password'
        }
    });

    try {
        // Check authentication status
        const authStatus = blogService.getAuthStatus();
        console.log('Auth Status:', authStatus);

        // Authenticate if not already authenticated
        if (!authStatus.authenticated) {
            console.log('Authenticating with WordPress CMS...');
            const token = await blogService.authenticate();
            console.log('✅ Authentication successful');
            console.log('Token expires in:', formatTimeRemaining(blogService.jwtService.getTokenTimeToExpiry()));
        }

        // Get current user information
        const currentUser = await blogService.getCurrentUser();
        console.log('Current User:', {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            roles: currentUser.roles
        });

        // Get posts with authentication
        console.log('\nFetching posts with JWT authentication...');
        const posts = await blogService.getPosts({
            perPage: 5,
            page: 1
        });
        console.log(`✅ Retrieved ${posts.length} posts`);

        // Get protected content (if available)
        try {
            const protectedContent = await blogService.makeAuthenticatedRequest('/pages?status=private');
            console.log(`✅ Retrieved ${protectedContent.length} private pages`);
        } catch (error) {
            console.log('ℹ️  No access to private content or no private pages available');
        }

    } catch (error) {
        console.error('❌ Error in basic JWT example:', error.message);
    }
}

// Example 2: Error handling and token refresh
async function errorHandlingExample() {
    console.log('\n=== Error Handling and Token Refresh Example ===\n');

    const blogService = new WordPressBlogService({
        useJWTAuth: true,
        cmsBaseURL: 'https://cms.saraivavision.com.br'
        // Note: No credentials provided to demonstrate error handling
    });

    try {
        // This will fail without credentials
        await blogService.authenticate();
    } catch (error) {
        console.log('❌ Authentication failed as expected:', error.message);
        console.log('💡 In production, provide valid credentials in environment variables');
    }
}

// Example 3: Using the JWT service directly
async function directJWTServiceExample() {
    console.log('\n=== Direct JWT Service Example ===\n');

    const jwtService = new WordPressJWTAuthService({
        baseURL: 'https://cms.saraivavision.com.br',
        credentials: {
            username: 'your_wordpress_username',
            password: 'your_wordpress_password'
        }
    });

    try {
        // Manually authenticate
        console.log('Manual authentication...');
        const token = await jwtService.authenticate();
        console.log('✅ Token obtained successfully');

        // Make direct authenticated requests
        const userData = await jwtService.makeAuthenticatedRequest('/users/me');
        console.log('✅ User data retrieved:', userData.name);

        // Get posts using authenticated endpoint
        const posts = await jwtService.makeAuthenticatedRequest('/posts', {
            params: { per_page: 3 }
        });
        console.log(`✅ Retrieved ${posts.length} posts via JWT`);

        // Validate token
        const isValid = await jwtService.validateToken();
        console.log('Token validation:', isValid ? '✅ Valid' : '❌ Invalid');

    } catch (error) {
        console.error('❌ Error in direct JWT service example:', error.message);
    }
}

// Example 4: Service without JWT (backwards compatibility)
async function backwardsCompatibilityExample() {
    console.log('\n=== Backwards Compatibility Example ===\n');

    // Service without JWT authentication
    const blogService = new WordPressBlogService({
        useJWTAuth: false // Explicitly disabled
    });

    try {
        console.log('Fetching public posts without JWT...');
        const posts = await blogService.getPosts({
            perPage: 3,
            status: 'publish' // Only public content
        });
        console.log(`✅ Retrieved ${posts.length} public posts`);

        const categories = await blogService.getCategories();
        console.log(`✅ Retrieved ${categories.length} categories`);

        // These operations don't require authentication
        console.log('✅ Public operations work without JWT');

    } catch (error) {
        console.error('❌ Error in backwards compatibility example:', error.message);
    }
}

// Example 5: Working with environment variables
async function environmentVariablesExample() {
    console.log('\n=== Environment Variables Example ===\n');

    // In production, these would be set in your .env file:
    /*
    WORDPRESS_JWT_USERNAME=your_username
    WORDPRESS_JWT_PASSWORD=your_password
    WORDPRESS_CMS_URL=https://cms.saraivavision.com.br
    */

    const blogService = new WordPressBlogService({
        useJWTAuth: true,
        cmsBaseURL: process.env.WORDPRESS_CMS_URL || 'https://cms.saraivavision.com.br',
        jwtCredentials: {
            username: process.env.WORDPRESS_JWT_USERNAME,
            password: process.env.WORDPRESS_JWT_PASSWORD
        }
    });

    try {
        // Service will automatically use environment variables if available
        const authStatus = blogService.getAuthStatus();
        console.log('Environment-based auth status:', authStatus);

        if (authStatus.enabled && process.env.WORDPRESS_JWT_USERNAME) {
            const posts = await blogService.getPosts({ perPage: 2 });
            console.log(`✅ Retrieved ${posts.length} posts using env vars`);
        } else {
            console.log('ℹ️  Set WORDPRESS_JWT_USERNAME and WORDPRESS_JWT_PASSWORD to test');
        }

    } catch (error) {
        console.error('❌ Error in environment variables example:', error.message);
    }
}

// Example 6: React hook example (for use in components)
function createWordPressHookExample() {
    console.log('\n=== React Hook Usage Example ===\n');

    // This shows how you would use the service in a React component
    const hookExample = `
import { useState, useEffect } from 'react';
import WordPressBlogService from '../services/WordPressBlogService.js';

export function useWordPressBlog() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [authStatus, setAuthStatus] = useState(null);

    const blogService = new WordPressBlogService({
        useJWTAuth: true,
        cmsBaseURL: process.env.REACT_APP_WORDPRESS_CMS_URL,
        jwtCredentials: {
            username: process.env.REACT_APP_WORDPRESS_JWT_USERNAME,
            password: process.env.REACT_APP_WORDPRESS_JWT_PASSWORD
        }
    });

    useEffect(() => {
        const initializeService = async () => {
            try {
                setAuthStatus(blogService.getAuthStatus());

                if (authStatus?.enabled && !authStatus?.authenticated) {
                    await blogService.authenticate();
                    setAuthStatus(blogService.getAuthStatus());
                }

                await loadPosts();
            } catch (err) {
                setError(err.message);
            }
        };

        initializeService();
    }, []);

    const loadPosts = async () => {
        setLoading(true);
        setError(null);

        try {
            const fetchedPosts = await blogService.getPosts({
                perPage: 10,
                page: 1
            });
            setPosts(fetchedPosts);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const refreshAuth = async () => {
        try {
            await blogService.authenticate();
            setAuthStatus(blogService.getAuthStatus());
        } catch (err) {
            setError(err.message);
        }
    };

    return {
        posts,
        loading,
        error,
        authStatus,
        loadPosts,
        refreshAuth,
        blogService
    };
}

// Usage in component:
function BlogComponent() {
    const { posts, loading, error, authStatus, refreshAuth } = useWordPressBlog();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <div>
                Auth Status: {authStatus?.enabled ?
                    (authStatus?.authenticated ? '✅ Authenticated' : '❌ Not Authenticated')
                    : '❌ Disabled'
                }
                {!authStatus?.authenticated && authStatus?.enabled && (
                    <button onClick={refreshAuth}>Authenticate</button>
                )}
            </div>
            <div>
                {posts.map(post => (
                    <article key={post.id}>
                        <h2>{post.title.rendered}</h2>
                        <div dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
                    </article>
                ))}
            </div>
        </div>
    );
}`;

    console.log('React hook example created');
    console.log(hookExample);
}

// Run all examples
async function runAllExamples() {
    console.log('🚀 WordPress JWT Integration Examples\n');

    try {
        await basicJWTExample();
        await errorHandlingExample();
        await directJWTServiceExample();
        await backwardsCompatibilityExample();
        await environmentVariablesExample();
        await createWordPressHookExample();

        console.log('\n✅ All examples completed');
        console.log('\n📋 Setup Instructions:');
        console.log('1. Set environment variables:');
        console.log('   WORDPRESS_JWT_USERNAME=your_username');
        console.log('   WORDPRESS_JWT_PASSWORD=your_password');
        console.log('   WORDPRESS_CMS_URL=https://cms.saraivavision.com.br');
        console.log('2. Install JWT Authentication plugin in WordPress');
        console.log('3. Ensure user has proper API permissions');

    } catch (error) {
        console.error('❌ Error running examples:', error.message);
    }
}

// Export examples for individual use
export {
    basicJWTExample,
    errorHandlingExample,
    directJWTServiceExample,
    backwardsCompatibilityExample,
    environmentVariablesExample,
    createWordPressHookExample,
    runAllExamples
};

// Auto-run if this file is executed directly
if (typeof window === 'undefined') {
    runAllExamples();
}
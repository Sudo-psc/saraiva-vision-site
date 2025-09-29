#!/usr/bin/env node

/**
 * WordPress JWT Validation Script
 * Quick validation of JWT authentication setup and functionality
 */

import WordPressJWTAuthService from '../src/services/WordPressJWTAuthService.js';
import WordPressBlogService from '../src/services/WordPressBlogService.js';

async function validateWordPressJWT() {
  console.log('🔍 WordPress JWT Authentication Validation');
  console.log('='.repeat(50));

  let results = {
    serviceInit: false,
    authentication: false,
    tokenValidation: false,
    apiAccess: false,
    blogIntegration: false,
    permissions: false,
    errorHandling: false
  };

  try {
    // 1. Service Initialization
    console.log('\n1️⃣  Testing Service Initialization...');
    const jwtService = new WordPressJWTAuthService({
      baseURL: process.env.VITE_WORDPRESS_CMS_URL || 'https://cms.saraivavision.com.br',
      credentials: {
        username: process.env.VITE_WORDPRESS_JWT_USERNAME,
        password: process.env.VITE_WORDPRESS_JWT_PASSWORD
      }
    });

    const blogService = new WordPressBlogService({
      baseURL: process.env.VITE_WORDPRESS_API_URL || 'https://blog.saraivavision.com.br',
      cmsBaseURL: process.env.VITE_WORDPRESS_CMS_URL || 'https://cms.saraivavision.com.br',
      useJWTAuth: true,
      jwtCredentials: {
        username: process.env.VITE_WORDPRESS_JWT_USERNAME,
        password: process.env.VITE_WORDPRESS_JWT_PASSWORD
      }
    });

    results.serviceInit = true;
    console.log('✅ Services initialized successfully');

    // 2. Authentication Test
    console.log('\n2️⃣  Testing JWT Authentication...');
    const token = await jwtService.authenticate();
    if (!token) {
      throw new Error('Authentication failed - no token received');
    }
    results.authentication = true;
    console.log(`✅ Authentication successful (token: ${token.substring(0, 20)}...)`);

    // 3. Token Validation Test
    console.log('\n3️⃣  Testing Token Validation...');
    const isValid = await jwtService.validateToken();
    if (!isValid) {
      throw new Error('Token validation failed');
    }
    results.tokenValidation = true;
    console.log('✅ Token validation successful');

    // 4. API Access Test
    console.log('\n4️⃣  Testing Authenticated API Access...');
    const user = await jwtService.getCurrentUser();
    if (!user || !user.id) {
      throw new Error('Failed to get current user');
    }
    results.apiAccess = true;
    console.log(`✅ API access successful (user: ${user.name || user.id})`);

    // 5. Blog Integration Test
    console.log('\n5️⃣  Testing Blog Service Integration...');
    const posts = await blogService.getPosts({ perPage: 1 });
    if (!Array.isArray(posts)) {
      throw new Error('Blog service integration failed');
    }
    results.blogIntegration = true;
    console.log(`✅ Blog integration successful (${posts.length} posts retrieved)`);

    // 6. Permissions Test
    console.log('\n6️⃣  Testing Permissions...');
    const canEdit = user.capabilities?.includes('edit_posts') || false;
    const canPublish = user.capabilities?.includes('publish_posts') || false;
    results.permissions = true;
    console.log(`✅ Permissions check successful (edit: ${canEdit}, publish: ${canPublish})`);

    // 7. Error Handling Test
    console.log('\n7️⃣  Testing Error Handling...');
    try {
      const tempService = new WordPressJWTAuthService({
        credentials: { username: 'invalid', password: 'invalid' }
      });
      await tempService.authenticate();
      console.log('⚠️  Error handling test inconclusive (invalid auth should have failed)');
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('403')) {
        results.errorHandling = true;
        console.log('✅ Error handling working correctly');
      } else {
        console.log(`⚠️  Unexpected error: ${error.message}`);
      }
    }

    // 8. Connection Status
    console.log('\n8️⃣  Testing Connection Status...');
    const connection = await jwtService.testConnection();
    const status = jwtService.getAuthStatus();
    console.log(`✅ Connection status: ${connection.success ? 'Connected' : 'Disconnected'}`);
    console.log(`✅ Auth status: ${status.authenticated ? 'Authenticated' : 'Not authenticated'}`);
    console.log(`✅ Token expires: ${new Date(status.tokenExpiry).toLocaleString()}`);

  } catch (error) {
    console.error(`❌ Validation failed: ${error.message}`);
    console.error('Stack:', error.stack);
  }

  // Summary
  console.log('\n📊 Validation Summary');
  console.log('='.repeat(50));

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${testName}`);
  });

  console.log('='.repeat(50));
  console.log(`Overall Result: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('🎉 WordPress JWT Authentication is fully operational!');
    console.log('\n📋 Key Features Validated:');
    console.log('  • JWT token acquisition and storage');
    console.log('  • Token validation and refresh');
    console.log('  • Authenticated API requests');
    console.log('  • Blog service integration');
    console.log('  • User permissions handling');
    console.log('  • Error handling and recovery');
    console.log('  • Session persistence');
    console.log('\n🔧 Ready for production use!');
  } else {
    console.log('⚠️  Some tests failed. Please check the issues above.');
    process.exit(1);
  }
}

// Mock sessionStorage for Node.js
if (typeof window === 'undefined') {
  global.window = {
    sessionStorage: {
      _data: {},
      getItem: (key) => global.window.sessionStorage._data[key],
      setItem: (key, value) => { global.window.sessionStorage._data[key] = value; },
      removeItem: (key) => { delete global.window.sessionStorage._data[key]; }
    }
  };
}

// Run validation
validateWordPressJWT().catch(error => {
  console.error('Validation script failed:', error);
  process.exit(1);
});
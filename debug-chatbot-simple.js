#!/usr/bin/env node

/**
 * Simple debug script to test chatbot API step by step
 */

import fetch from 'node-fetch';

async function testBasicAPI() {
    console.log('🔍 Testing basic API connectivity...');

    try {
        // Test if server is running
        console.log('1. Testing server connectivity...');
        const healthResponse = await fetch('http://localhost:3000/api/chatbot/health');
        console.log('   Health check status:', healthResponse.status);

        if (healthResponse.ok) {
            const healthText = await healthResponse.text();
            console.log('   Health response:', healthText);
        }

        // Test basic chat endpoint
        console.log('\n2. Testing chat endpoint...');
        const chatResponse = await fetch('http://localhost:3000/api/chatbot/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'teste',
                sessionId: 'debug-session',
                conversationHistory: [],
                context: {}
            })
        });

        console.log('   Chat response status:', chatResponse.status);
        console.log('   Chat response headers:', Object.fromEntries(chatResponse.headers.entries()));

        const responseText = await chatResponse.text();
        console.log('   Response text length:', responseText.length);
        console.log('   Response text preview:', responseText.substring(0, 500));

        if (responseText) {
            try {
                const data = JSON.parse(responseText);
                console.log('   ✅ JSON parsing successful');
                console.log('   Response structure:', {
                    success: data.success,
                    hasData: !!data.data,
                    hasError: !!data.error
                });
            } catch (jsonError) {
                console.log('   ❌ JSON parsing failed:', jsonError.message);
                console.log('   Raw response:', responseText);
            }
        } else {
            console.log('   ❌ Empty response');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Error details:', error);
    }
}

// Run the test
testBasicAPI();
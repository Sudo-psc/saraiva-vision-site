/**
 * Simple Chatbot API Endpoint
 * Alternative endpoint for chatbot functionality
 */

import chatbotHandler from './chatbot.js';

export default async function handler(req, res) {
    return chatbotHandler(req, res);
}
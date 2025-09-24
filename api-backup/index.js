/**
 * Chatbot API Index - Main Entry Point
 * Routes requests to appropriate chatbot handlers
 */

import chatHandler from './chat.js';

export default async function handler(req, res) {
    // Route all requests to chat handler
    return chatHandler(req, res);
}
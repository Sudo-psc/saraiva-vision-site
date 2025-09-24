/**
 * Chatbot API Index - Main Entry Point
 * Routes requests to appropriate chatbot handlers
 */

import chatHandler from '../chatbot.js';

export default async function handler(req, res) {
    // Route all requests to main chatbot handler
    return chatHandler(req, res);
}
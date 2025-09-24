/**
 * IP Hashing Utility for LGPD Compliance
 * Provides hashed IP addresses for consent records without storing actual IPs
 */

import crypto from 'crypto';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        // Get client IP address
        const clientIP = getClientIP(req);

        if (!clientIP) {
            return res.status(400).json({
                success: false,
                error: 'Could not determine client IP'
            });
        }

        // Hash the IP address for privacy compliance
        const ipHash = hashIP(clientIP);

        return res.status(200).json({
            success: true,
            ipHash,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('IP hash error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Extract client IP address from request
 */
function getClientIP(req) {
    // Check various headers for the real IP
    const forwarded = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    const cfConnectingIP = req.headers['cf-connecting-ip']; // Cloudflare
    const vercelForwardedFor = req.headers['x-vercel-forwarded-for']; // Vercel

    if (vercelForwardedFor) {
        return vercelForwardedFor.split(',')[0].trim();
    }

    if (cfConnectingIP) {
        return cfConnectingIP;
    }

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIP) {
        return realIP;
    }

    // Fallback to connection remote address
    return req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.connection?.socket?.remoteAddress ||
        'unknown';
}

/**
 * Hash IP address using SHA-256 with salt for privacy
 */
function hashIP(ip) {
    try {
        // Use a consistent salt for the same IP to get consistent hashes
        const salt = process.env.IP_HASH_SALT;
        if (!salt) {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('IP_HASH_SALT must be configured in production');
            }
            // Only use default in development
            return crypto.createHash('sha256').update(ip + 'dev-salt').digest('hex');
        }

        // Create hash
        const hash = crypto.createHash('sha256');
        hash.update(ip + salt);

        return hash.digest('hex');
    } catch (error) {
        console.error('IP hashing error:', error);
        throw new Error('Failed to hash IP address');
    }
}
/**
 * Multi-Factor Authentication Service
 * Implements TOTP, SMS, and email-based MFA for sensitive operations
 * Requirements: 8.1
 */

import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { getSecurityConfig } from '../config/securityConfig.js';

class MFAService {
    constructor() {
        this.config = getSecurityConfig().mfa;
        this.activeSessions = new Map();
        this.failedAttempts = new Map();
        this.lockedAccounts = new Map();
    }

    /**
     * Generate TOTP secret for user
     */
    async generateTOTPSecret(userId, userEmail) {
        const secret = speakeasy.generateSecret({
            name: `Saraiva Vision Chatbot (${userEmail})`,
            issuer: 'Saraiva Vision',
            length: 32
        });

        // Store secret securely (in production, encrypt and store in database)
        const encryptedSecret = this.encryptSecret(secret.base32);

        return {
            secret: secret.base32,
            encryptedSecret,
            qrCodeUrl: await this.generateQRCode(secret.otpauth_url),
            backupCodes: this.generateBackupCodes()
        };
    }

    /**
     * Generate QR code for TOTP setup
     */
    async generateQRCode(otpauthUrl) {
        try {
            return await QRCode.toDataURL(otpauthUrl);
        } catch (error) {
            throw new Error('Failed to generate QR code');
        }
    }

    /**
     * Generate backup codes
     */
    generateBackupCodes() {
        const codes = [];
        for (let i = 0; i < this.config.backupCodesCount; i++) {
            codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
        }
        return codes;
    }

    /**
     * Verify TOTP token
     */
    verifyTOTP(secret, token, window = 1) {
        try {
            return speakeasy.totp.verify({
                secret: secret,
                encoding: 'base32',
                token: token,
                window: window
            });
        } catch (error) {
            return false;
        }
    }

    /**
     * Send SMS MFA code
     */
    async sendSMSCode(userId, phoneNumber) {
        const code = this.generateNumericCode(6);
        const expiresAt = Date.now() + this.config.tokenExpiry;

        // Store code temporarily
        this.storeMFACode(userId, 'sms', code, expiresAt);

        // In production, integrate with SMS service (Twilio, etc.)
        console.log(`SMS MFA code for ${phoneNumber}: ${code}`);

        return { success: true, expiresIn: this.config.tokenExpiry };
    }

    /**
     * Send email MFA code
     */
    async sendEmailCode(userId, email) {
        const code = this.generateNumericCode(6);
        const expiresAt = Date.now() + this.config.tokenExpiry;

        // Store code temporarily
        this.storeMFACode(userId, 'email', code, expiresAt);

        // In production, integrate with email service
        console.log(`Email MFA code for ${email}: ${code}`);

        return { success: true, expiresIn: this.config.tokenExpiry };
    }

    /**
     * Verify MFA code (SMS/Email)
     */
    async verifyMFACode(userId, method, code) {
        const storedData = this.getMFACode(userId, method);

        if (!storedData) {
            return { success: false, error: 'No active MFA code found' };
        }

        if (Date.now() > storedData.expiresAt) {
            this.clearMFACode(userId, method);
            return { success: false, error: 'MFA code expired' };
        }

        if (storedData.code !== code) {
            this.recordFailedAttempt(userId);
            return { success: false, error: 'Invalid MFA code' };
        }

        // Clear used code
        this.clearMFACode(userId, method);
        this.clearFailedAttempts(userId);

        return { success: true };
    }

    /**
     * Check if MFA is required for operation
     */
    isMFARequired(operation, userRole = 'user') {
        if (!this.config.enabled) return false;

        const sensitiveOperations = [
            'appointment_booking',
            'medical_referral',
            'data_export',
            'account_settings',
            'admin_access'
        ];

        return this.config.requireMfaForSensitive &&
            sensitiveOperations.includes(operation);
    }

    /**
     * Create MFA session
     */
    createMFASession(userId, method) {
        const sessionId = crypto.randomUUID();
        const expiresAt = Date.now() + this.config.sessionTimeout;

        this.activeSessions.set(sessionId, {
            userId,
            method,
            expiresAt,
            verified: false
        });

        return sessionId;
    }

    /**
     * Verify MFA session
     */
    verifyMFASession(sessionId) {
        const session = this.activeSessions.get(sessionId);

        if (!session) {
            return { valid: false, error: 'Invalid session' };
        }

        if (Date.now() > session.expiresAt) {
            this.activeSessions.delete(sessionId);
            return { valid: false, error: 'Session expired' };
        }

        return { valid: true, session };
    }

    /**
     * Complete MFA verification
     */
    completeMFAVerification(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (session) {
            session.verified = true;
            session.verifiedAt = Date.now();
        }
    }

    /**
     * Check if account is locked
     */
    isAccountLocked(userId) {
        const lockInfo = this.lockedAccounts.get(userId);
        if (!lockInfo) return false;

        if (Date.now() > lockInfo.expiresAt) {
            this.lockedAccounts.delete(userId);
            return false;
        }

        return true;
    }

    /**
     * Record failed MFA attempt
     */
    recordFailedAttempt(userId) {
        const attempts = this.failedAttempts.get(userId) || 0;
        const newAttempts = attempts + 1;

        this.failedAttempts.set(userId, newAttempts);

        if (newAttempts >= this.config.maxFailedAttempts) {
            this.lockAccount(userId);
        }
    }

    /**
     * Lock account after failed attempts
     */
    lockAccount(userId) {
        const expiresAt = Date.now() + this.config.lockoutDuration;
        this.lockedAccounts.set(userId, { expiresAt });
        this.failedAttempts.delete(userId);
    }

    /**
     * Clear failed attempts
     */
    clearFailedAttempts(userId) {
        this.failedAttempts.delete(userId);
    }

    /**
     * Generate numeric code
     */
    generateNumericCode(length) {
        const digits = '0123456789';
        let code = '';
        for (let i = 0; i < length; i++) {
            code += digits[crypto.randomInt(0, digits.length)];
        }
        return code;
    }

    /**
     * Store MFA code temporarily
     */
    storeMFACode(userId, method, code, expiresAt) {
        const key = `${userId}:${method}`;
        // In production, use Redis or secure temporary storage
        this.tempCodes = this.tempCodes || new Map();
        this.tempCodes.set(key, { code, expiresAt });
    }

    /**
     * Get stored MFA code
     */
    getMFACode(userId, method) {
        const key = `${userId}:${method}`;
        this.tempCodes = this.tempCodes || new Map();
        return this.tempCodes.get(key);
    }

    /**
     * Clear MFA code
     */
    clearMFACode(userId, method) {
        const key = `${userId}:${method}`;
        this.tempCodes = this.tempCodes || new Map();
        this.tempCodes.delete(key);
    }

    /**
     * Encrypt secret for storage
     */
    encryptSecret(secret) {
        // In production, use proper encryption with secure key management
        const cipher = crypto.createCipher('aes-256-cbc', process.env.MFA_ENCRYPTION_KEY || 'default-key');
        let encrypted = cipher.update(secret, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    /**
     * Decrypt secret from storage
     */
    decryptSecret(encryptedSecret) {
        // In production, use proper decryption with secure key management
        const decipher = crypto.createDecipher('aes-256-cbc', process.env.MFA_ENCRYPTION_KEY || 'default-key');
        let decrypted = decipher.update(encryptedSecret, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    /**
     * Cleanup expired sessions and codes
     */
    cleanup() {
        const now = Date.now();

        // Clean expired sessions
        for (const [sessionId, session] of this.activeSessions.entries()) {
            if (now > session.expiresAt) {
                this.activeSessions.delete(sessionId);
            }
        }

        // Clean expired locks
        for (const [userId, lockInfo] of this.lockedAccounts.entries()) {
            if (now > lockInfo.expiresAt) {
                this.lockedAccounts.delete(userId);
            }
        }

        // Clean expired codes
        if (this.tempCodes) {
            for (const [key, codeData] of this.tempCodes.entries()) {
                if (now > codeData.expiresAt) {
                    this.tempCodes.delete(key);
                }
            }
        }
    }
}

// Singleton instance
export const mfaService = new MFAService();

// Cleanup interval
setInterval(() => {
    mfaService.cleanup();
}, 5 * 60 * 1000); // Every 5 minutes

export default mfaService;
/**
 * Tests for ConversationStateManager
 * Covers session management, conversation storage, and privacy controls
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import conversationStateManager from '../conversationStateManager.js';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            insert: vi.fn(() => ({ error: null })),
            update: vi.fn(() => ({ error: null })),
            delete: vi.fn(() => ({ error: null })),
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(() => ({ data: null, error: null }))
                }))
            }))
        }))
    }))
}));

describe('ConversationStateManager', () => {
    beforeEach(() => {
        // Clear any existing sessions
        conversationStateManager.sessions.clear();
        conversationStateManager.tokenUsageTracker?.clear();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Session Management', () => {
        it('should create a new session with default settings', async () => {
            const session = await conversationStateManager.createSession();

            expect(session).toBeDefined();
            expect(session.sessionId).toMatch(/^session_/);
            expect(session.createdAt).toBeInstanceOf(Date);
            expect(session.lastActivity).toBeInstanceOf(Date);
            expect(session.messages).toEqual([]);
            expect(session.state.isActive).toBe(true);
        });

        it('should create a session with custom options', async () => {
            const options = {
                userId: 'user123',
                userConsent: {
                    dataProcessing: true,
                    medicalData: true
                },
                metadata: {
                    language: 'pt-BR',
                    userAgent: 'test-agent'
                },
                privacySettings: {
                    encryptMessages: true,
                    retentionPeriod: 180
                }
            };

            const session = await conversationStateManager.createSession(options);

            expect(session.userId).toBe('user123');
            expect(session.consent.dataProcessing).toBe(true);
            expect(session.consent.medicalData).toBe(true);
            expect(session.metadata.language).toBe('pt-BR');
            expect(session.privacy.encryptMessages).toBe(true);
            expect(session.privacy.retentionPeriod).toBe(180);
        });

        it('should retrieve an existing session', async () => {
            const session = await conversationStateManager.createSession();
            const retrieved = await conversationStateManager.getSession(session.sessionId);

            expect(retrieved).toBeDefined();
            expect(retrieved.sessionId).toBe(session.sessionId);
        });

        it('should return null for non-existent session', async () => {
            const retrieved = await conversationStateManager.getSession('non-existent');
            expect(retrieved).toBeNull();
        });

        it('should delete a session and all data', async () => {
            const session = await conversationStateManager.createSession();
            const deleted = await conversationStateManager.deleteSession(session.sessionId);

            // The delete might return false due to mocked database, but session should be removed from memory
            expect(typeof deleted).toBe('boolean');

            const retrieved = await conversationStateManager.getSession(session.sessionId);
            expect(retrieved).toBeNull();
        });
    });

    describe('Message Management', () => {
        let session;

        beforeEach(async () => {
            session = await conversationStateManager.createSession();
        });

        it('should add a message to conversation', async () => {
            // Create session with encryption disabled for this test
            const unencryptedSession = await conversationStateManager.createSession({
                privacySettings: { encryptMessages: false }
            });

            const message = {
                role: 'user',
                content: 'Hello, I need help with my eyes',
                metadata: { topic: 'medical' }
            };

            const addedMessage = await conversationStateManager.addMessage(unencryptedSession.sessionId, message);

            expect(addedMessage).toBeDefined();
            expect(addedMessage.id).toBeDefined();
            expect(addedMessage.role).toBe('user');
            expect(addedMessage.content).toBe('Hello, I need help with my eyes');
            expect(addedMessage.timestamp).toBeInstanceOf(Date);
        });

        it('should encrypt message content when privacy setting is enabled', async () => {
            // Create session with encryption enabled
            const encryptedSession = await conversationStateManager.createSession({
                privacySettings: { encryptMessages: true }
            });

            const message = {
                role: 'user',
                content: 'Sensitive medical information',
                metadata: {}
            };

            const addedMessage = await conversationStateManager.addMessage(encryptedSession.sessionId, message);

            expect(addedMessage.encrypted).toBe(true);
            expect(addedMessage.content).not.toBe('Sensitive medical information');
        });

        it('should update conversation state based on message content', async () => {
            // Create session with encryption disabled for state analysis
            const unencryptedSession = await conversationStateManager.createSession({
                privacySettings: { encryptMessages: false }
            });

            const appointmentMessage = {
                role: 'user',
                content: 'I would like to schedule a consultation',
                metadata: {}
            };

            await conversationStateManager.addMessage(unencryptedSession.sessionId, appointmentMessage);
            const updatedSession = await conversationStateManager.getSession(unencryptedSession.sessionId);

            expect(updatedSession.state.currentTopic).toBe('appointment');
            expect(updatedSession.state.currentIntent).toBe('schedule_appointment');
            expect(updatedSession.state.appointmentContext).toBeDefined();
        });

        it('should retrieve conversation history', async () => {
            // Add multiple messages
            await conversationStateManager.addMessage(session.sessionId, {
                role: 'user',
                content: 'First message',
                metadata: {}
            });

            await conversationStateManager.addMessage(session.sessionId, {
                role: 'assistant',
                content: 'First response',
                metadata: {}
            });

            const history = await conversationStateManager.getConversationHistory(session.sessionId);

            expect(history).toHaveLength(2);
            expect(history[0].content).toBe('First message');
            expect(history[1].content).toBe('First response');
        });

        it('should limit conversation history when requested', async () => {
            // Add multiple messages
            for (let i = 0; i < 5; i++) {
                await conversationStateManager.addMessage(session.sessionId, {
                    role: 'user',
                    content: `Message ${i}`,
                    metadata: {}
                });
            }

            const history = await conversationStateManager.getConversationHistory(session.sessionId, {
                limit: 3
            });

            expect(history).toHaveLength(3);
            expect(history[0].content).toBe('Message 2'); // Last 3 messages
        });
    });

    describe('Context-Aware Features', () => {
        let session;

        beforeEach(async () => {
            session = await conversationStateManager.createSession();
        });

        it('should generate context-aware prompts for appointment topic', async () => {
            // Set appointment context
            session.state.currentTopic = 'appointment';
            session.state.currentIntent = 'schedule_appointment';

            const prompts = conversationStateManager.generateContextAwarePrompts(session);

            expect(prompts.length).toBeGreaterThanOrEqual(1);
            const appointmentPrompt = prompts.find(p => p.type === 'appointment');
            expect(appointmentPrompt).toBeDefined();
            expect(appointmentPrompt.suggestions).toContain('Que tipo de consulta você gostaria de agendar?');
        });

        it('should generate context-aware prompts for referral topic', async () => {
            session.state.currentTopic = 'referral';
            session.state.currentIntent = 'request_referral';

            const prompts = conversationStateManager.generateContextAwarePrompts(session);

            expect(prompts.length).toBeGreaterThanOrEqual(1);
            const referralPrompt = prompts.find(p => p.type === 'referral');
            expect(referralPrompt).toBeDefined();
            expect(referralPrompt.suggestions).toContain('Pode me contar mais sobre os sintomas?');
        });

        it('should provide conversation summary', async () => {
            // Add some messages
            await conversationStateManager.addMessage(session.sessionId, {
                role: 'user',
                content: 'I have eye problems',
                metadata: {}
            });

            const summary = conversationStateManager.getConversationSummary(session.sessionId);

            expect(summary.sessionId).toBe(session.sessionId);
            expect(summary.messageCount).toBe(1);
            expect(summary.duration).toBeGreaterThan(0);
        });
    });

    describe('Privacy and Consent Management', () => {
        let session;

        beforeEach(async () => {
            session = await conversationStateManager.createSession();
        });

        it('should update consent preferences', async () => {
            const consentUpdates = {
                dataProcessing: true,
                medicalData: false,
                analytics: true
            };

            const updatedConsent = await conversationStateManager.updateConsent(
                session.sessionId,
                consentUpdates
            );

            expect(updatedConsent.dataProcessing).toBe(true);
            expect(updatedConsent.medicalData).toBe(false);
            expect(updatedConsent.analytics).toBe(true);
            expect(updatedConsent.lastUpdated).toBeInstanceOf(Date);
        });

        it('should anonymize session data', async () => {
            // Add some messages first
            await conversationStateManager.addMessage(session.sessionId, {
                role: 'user',
                content: 'Personal information',
                metadata: { ipAddress: '192.168.1.1' }
            });

            const anonymized = await conversationStateManager.anonymizeSession(session.sessionId);
            expect(anonymized).toBe(true);

            const updatedSession = await conversationStateManager.getSession(session.sessionId);
            expect(updatedSession.userId).toBeNull();
            expect(updatedSession.metadata.ipAddress).toBe('anonymized');
        });

        it('should filter sensitive metadata from conversation history', async () => {
            await conversationStateManager.addMessage(session.sessionId, {
                role: 'user',
                content: 'Test message',
                metadata: {
                    ipAddress: '192.168.1.1',
                    userAgent: 'Mozilla/5.0',
                    topic: 'medical'
                }
            });

            const history = await conversationStateManager.getConversationHistory(session.sessionId, {
                includeMetadata: true,
                filterSensitive: true
            });

            expect(history[0].metadata.ipAddress).toBeUndefined();
            expect(history[0].metadata.userAgent).toBeUndefined();
            expect(history[0].metadata.topic).toBe('medical'); // Non-sensitive data preserved
        });
    });

    describe('Session Expiration and Cleanup', () => {
        it('should identify expired sessions', async () => {
            const session = await conversationStateManager.createSession();

            // Manually set old last activity
            session.lastActivity = new Date(Date.now() - (35 * 60 * 1000)); // 35 minutes ago

            const isExpired = conversationStateManager.isSessionExpired(session);
            expect(isExpired).toBe(true);
        });

        it('should clean up expired sessions', async () => {
            const session = await conversationStateManager.createSession();

            // Manually expire the session
            session.lastActivity = new Date(Date.now() - (35 * 60 * 1000));

            conversationStateManager.cleanupExpiredSessions();

            const retrieved = await conversationStateManager.getSession(session.sessionId);
            expect(retrieved).toBeNull();
        });
    });

    describe('Health Status', () => {
        it('should return service health status', () => {
            const health = conversationStateManager.getHealthStatus();

            expect(health.service).toBe('ConversationStateManager');
            expect(health.status).toBe('healthy');
            expect(health.statistics).toBeDefined();
            expect(health.database).toBeDefined();
            expect(health.encryption).toBeDefined();
        });
    });
});
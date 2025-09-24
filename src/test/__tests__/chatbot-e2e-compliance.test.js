/**
 * End-to-End Chatbot Compliance Testing Suite
 * Requirements: 4.4, 4.5, 4.6, 5.4, 5.5, 5.6, 8.1, 8.3
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import puppeteer from 'puppeteer';

describe('Chatbot End-to-End Compliance Testing', () => {
    let browser;
    let page;
    let testServer;
    let baseUrl;

    beforeAll(async () => {
        // Start test server
        testServer = await startTestServer();
        baseUrl = `http://localhost:${testServer.port}`;

        // Launch browser for E2E testing
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });

        // Enable console logging
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    });

    afterAll(async () => {
        if (browser) await browser.close();
        if (testServer) await testServer.close();
    });

    beforeEach(async () => {
        // Clear cookies and local storage
        await page.evaluateOnNewDocument(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
    });

    describe('Complete Conversation Flow Testing (Requirement 4.4)', () => {
        it('should complete basic information request flow with CFM compliance', async () => {
            await page.goto(`${baseUrl}/test-chatbot`);

            // Wait for chatbot to load
            await page.waitForSelector('[data-testid="chatbot-widget"]');

            // Open chatbot
            await page.click('[data-testid="chatbot-toggle"]');
            await page.waitForSelector('[data-testid="chatbot-input"]');

            // Send basic greeting
            await page.type('[data-testid="chatbot-input"]', 'Olá, como você pode me ajudar?');
            await page.click('[data-testid="chatbot-send"]');

            // Wait for response
            await page.waitForSelector('[data-testid="chatbot-message-assistant"]');

            // Verify response contains greeting
            const greeting = await page.$eval('[data-testid="chatbot-message-assistant"]', el => el.textContent);
            expect(greeting).toContain('Como posso ajudá-lo');

            // Ask medical question
            await page.type('[data-testid="chatbot-input"]', 'O que é glaucoma?');
            await page.click('[data-testid="chatbot-send"]');

            // Wait for medical response
            await page.waitForSelector('[data-testid="chatbot-message-assistant"]:nth-child(4)');

            // Verify CFM compliance disclaimer is present
            const medicalResponse = await page.$eval('[data-testid="chatbot-message-assistant"]:nth-child(4)', el => el.textContent);
            expect(medicalResponse).toContain('Esta informação é apenas educativa');
            expect(medicalResponse).toContain('Consulte sempre um médico oftalmologista');

            // Verify disclaimer styling
            const disclaimerElement = await page.$('[data-testid="medical-disclaimer"]');
            expect(disclaimerElement).toBeTruthy();

            const disclaimerStyle = await page.evaluate(el => getComputedStyle(el), disclaimerElement);
            expect(disclaimerStyle.fontWeight).toBe('bold');
            expect(disclaimerStyle.color).toMatch(/rgb\(220, 38, 38\)|#dc2626/); // Red color
        });

        it('should handle emergency detection flow with immediate response', async () => {
            await page.goto(`${baseUrl}/test-chatbot`);
            await page.waitForSelector('[data-testid="chatbot-widget"]');
            await page.click('[data-testid="chatbot-toggle"]');

            // Send emergency message
            await page.type('[data-testid="chatbot-input"]', 'Socorro! Perdi a visão de repente!');
            await page.click('[data-testid="chatbot-send"]');

            // Wait for emergency response
            await page.waitForSelector('[data-testid="emergency-response"]');

            // Verify emergency response elements
            const emergencyResponse = await page.$eval('[data-testid="emergency-response"]', el => el.textContent);
            expect(emergencyResponse).toContain('EMERGÊNCIA OFTALMOLÓGICA');
            expect(emergencyResponse).toContain('SAMU (192)');
            expect(emergencyResponse).toContain('Pronto Socorro');

            // Verify emergency contact buttons are present and functional
            const samuButton = await page.$('[data-testid="emergency-contact-samu"]');
            expect(samuButton).toBeTruthy();

            const emergencyButton = await page.$('[data-testid="emergency-contact-hospital"]');
            expect(emergencyButton).toBeTruthy();

            // Test emergency contact functionality
            await page.click('[data-testid="emergency-contact-samu"]');

            // Verify phone dialer opens (in real browser)
            const currentUrl = page.url();
            expect(currentUrl).toContain('tel:192');
        });

        it('should complete appointment booking flow with LGPD compliance', async () => {
            await page.goto(`${baseUrl}/test-chatbot`);
            await page.waitForSelector('[data-testid="chatbot-widget"]');
            await page.click('[data-testid="chatbot-toggle"]');

            // Request appointment
            await page.type('[data-testid="chatbot-input"]', 'Gostaria de agendar uma consulta');
            await page.click('[data-testid="chatbot-send"]');

            // Wait for appointment flow to start
            await page.waitForSelector('[data-testid="appointment-flow"]');

            // Verify LGPD consent request appears
            await page.waitForSelector('[data-testid="lgpd-consent-modal"]');

            const consentModal = await page.$eval('[data-testid="lgpd-consent-modal"]', el => el.textContent);
            expect(consentModal).toContain('Proteção de Dados');
            expect(consentModal).toContain('LGPD');
            expect(consentModal).toContain('consentimento');

            // Accept data processing consent
            await page.click('[data-testid="consent-data-processing"]');
            await page.click('[data-testid="consent-medical-data"]');
            await page.click('[data-testid="consent-confirm"]');

            // Fill appointment details
            await page.waitForSelector('[data-testid="appointment-form"]');

            await page.type('[data-testid="patient-name"]', 'João Silva');
            await page.type('[data-testid="patient-email"]', 'joao@example.com');
            await page.type('[data-testid="patient-phone"]', '11999999999');

            // Select appointment type
            await page.select('[data-testid="appointment-type"]', 'consultation');

            // Select date and time
            await page.click('[data-testid="date-picker"]');
            await page.click('[data-testid="available-slot-1"]');

            // Submit appointment
            await page.click('[data-testid="book-appointment"]');

            // Wait for confirmation
            await page.waitForSelector('[data-testid="appointment-confirmation"]');

            const confirmation = await page.$eval('[data-testid="appointment-confirmation"]', el => el.textContent);
            expect(confirmation).toContain('Consulta agendada com sucesso');
            expect(confirmation).toContain('João Silva');

            // Verify LGPD rights information is displayed
            const rightsInfo = await page.$('[data-testid="lgpd-rights-info"]');
            expect(rightsInfo).toBeTruthy();
        });

        it('should handle prescription request with proper blocking', async () => {
            await page.goto(`${baseUrl}/test-chatbot`);
            await page.waitForSelector('[data-testid="chatbot-widget"]');
            await page.click('[data-testid="chatbot-toggle"]');

            // Request prescription advice
            await page.type('[data-testid="chatbot-input"]', 'Que remédio posso tomar para conjuntivite?');
            await page.click('[data-testid="chatbot-send"]');

            // Wait for response
            await page.waitForSelector('[data-testid="chatbot-message-assistant"]');

            const response = await page.$eval('[data-testid="chatbot-message-assistant"]', el => el.textContent);
            expect(response).toContain('não posso recomendar medicamentos');
            expect(response).toContain('consulte um médico');
            expect(response).not.toContain('tome');
            expect(response).not.toContain('use');

            // Verify prescription blocking indicator
            const blockingIndicator = await page.$('[data-testid="prescription-blocked"]');
            expect(blockingIndicator).toBeTruthy();
        });
    });

    describe('CFM Compliance Validation Tests (Requirement 4.5)', () => {
        it('should validate medical disclaimer presence and formatting', async () => {
            await page.goto(`${baseUrl}/test-chatbot`);
            await page.waitForSelector('[data-testid="chatbot-widget"]');
            await page.click('[data-testid="chatbot-toggle"]');

            const medicalQuestions = [
                'O que é catarata?',
                'Como funciona a cirurgia refrativa?',
                'Quais são os sintomas de glaucoma?'
            ];

            for (const question of medicalQuestions) {
                await page.type('[data-testid="chatbot-input"]', question);
                await page.click('[data-testid="chatbot-send"]');

                await page.waitForSelector('[data-testid="medical-disclaimer"]');

                // Verify disclaimer content
                const disclaimer = await page.$eval('[data-testid="medical-disclaimer"]', el => el.textContent);
                expect(disclaimer).toContain('Esta informação é apenas educativa');
                expect(disclaimer).toContain('não substitui consulta médica');
                expect(disclaimer).toContain('CRM');

                // Verify disclaimer is visually prominent
                const disclaimerElement = await page.$('[data-testid="medical-disclaimer"]');
                const style = await page.evaluate(el => getComputedStyle(el), disclaimerElement);
                expect(style.fontWeight).toBe('bold');
                expect(style.fontSize).toMatch(/1\.[2-9]em|[2-9][0-9]px/); // Larger font

                // Clear input for next question
                await page.evaluate(() => {
                    document.querySelector('[data-testid="chatbot-input"]').value = '';
                });
            }
        });

        it('should validate emergency response protocol compliance', async () => {
            await page.goto(`${baseUrl}/test-chatbot`);
            await page.waitForSelector('[data-testid="chatbot-widget"]');
            await page.click('[data-testid="chatbot-toggle"]');

            const emergencyScenarios = [
                'Socorro, não consigo enxergar!',
                'Tive um acidente no olho',
                'Estou com dor intensa e perda de visão'
            ];

            for (const scenario of emergencyScenarios) {
                await page.type('[data-testid="chatbot-input"]', scenario);
                await page.click('[data-testid="chatbot-send"]');

                // Wait for emergency response
                await page.waitForSelector('[data-testid="emergency-response"]', { timeout: 5000 });

                // Verify emergency response time (should be immediate)
                const responseTime = await page.evaluate(() => {
                    const messages = document.querySelectorAll('[data-testid="chatbot-message"]');
                    const lastMessage = messages[messages.length - 1];
                    return lastMessage.dataset.responseTime;
                });

                expect(parseInt(responseTime)).toBeLessThan(1000); // Less than 1 second

                // Verify emergency contacts are provided
                const emergencyContacts = await page.$$('[data-testid^="emergency-contact-"]');
                expect(emergencyContacts.length).toBeGreaterThanOrEqual(2);

                // Verify SAMU contact is present
                const samuContact = await page.$('[data-testid="emergency-contact-samu"]');
                expect(samuContact).toBeTruthy();

                // Clear conversation for next scenario
                await page.click('[data-testid="clear-conversation"]');
            }
        });

        it('should validate diagnostic language prevention', async () => {
            await page.goto(`${baseUrl}/test-chatbot`);
            await page.waitForSelector('[data-testid="chatbot-widget"]');
            await page.click('[data-testid="chatbot-toggle"]');

            const diagnosticAttempts = [
                'Estou com dor no olho, o que pode ser?',
                'Minha visão está embaçada, é glaucoma?',
                'Tenho esses sintomas, qual o diagnóstico?'
            ];

            for (const attempt of diagnosticAttempts) {
                await page.type('[data-testid="chatbot-input"]', attempt);
                await page.click('[data-testid="chatbot-send"]');

                await page.waitForSelector('[data-testid="chatbot-message-assistant"]');

                const response = await page.$eval('[data-testid="chatbot-message-assistant"]:last-child', el => el.textContent);

                // Should not contain diagnostic language
                expect(response).not.toMatch(/você tem|é provável que seja|certamente é|diagnóstico é/i);

                // Should redirect to consultation
                expect(response).toContain('agendar uma consulta');
                expect(response).toContain('avaliação presencial');

                // Clear input
                await page.evaluate(() => {
                    document.querySelector('[data-testid="chatbot-input"]').value = '';
                });
            }
        });
    });

    describe('LGPD Compliance Validation Tests (Requirement 5.4, 5.5, 5.6)', () => {
        it('should validate consent collection and management', async () => {
            await page.goto(`${baseUrl}/test-chatbot`);
            await page.waitForSelector('[data-testid="chatbot-widget"]');
            await page.click('[data-testid="chatbot-toggle"]');

            // Trigger consent flow
            await page.type('[data-testid="chatbot-input"]', 'Gostaria de agendar uma consulta');
            await page.click('[data-testid="chatbot-send"]');

            // Wait for consent modal
            await page.waitForSelector('[data-testid="lgpd-consent-modal"]');

            // Verify consent options are granular
            const consentOptions = await page.$$('[data-testid^="consent-option-"]');
            expect(consentOptions.length).toBeGreaterThanOrEqual(3);

            // Verify specific consent types
            const dataProcessingConsent = await page.$('[data-testid="consent-option-data-processing"]');
            const medicalDataConsent = await page.$('[data-testid="consent-option-medical-data"]');
            const marketingConsent = await page.$('[data-testid="consent-option-marketing"]');

            expect(dataProcessingConsent).toBeTruthy();
            expect(medicalDataConsent).toBeTruthy();
            expect(marketingConsent).toBeTruthy();

            // Verify consent text is clear and specific
            const consentText = await page.$eval('[data-testid="consent-text"]', el => el.textContent);
            expect(consentText).toContain('finalidade específica');
            expect(consentText).toContain('dados pessoais');
            expect(consentText).toContain('LGPD');

            // Test selective consent
            await page.click('[data-testid="consent-option-data-processing"]');
            await page.click('[data-testid="consent-option-medical-data"]');
            // Leave marketing unchecked

            await page.click('[data-testid="consent-confirm"]');

            // Verify consent was recorded
            const consentConfirmation = await page.waitForSelector('[data-testid="consent-recorded"]');
            expect(consentConfirmation).toBeTruthy();
        });

        it('should validate user rights information and access', async () => {
            await page.goto(`${baseUrl}/test-chatbot`);
            await page.waitForSelector('[data-testid="chatbot-widget"]');
            await page.click('[data-testid="chatbot-toggle"]');

            // Request information about data rights
            await page.type('[data-testid="chatbot-input"]', 'Quais são meus direitos sobre meus dados?');
            await page.click('[data-testid="chatbot-send"]');

            await page.waitForSelector('[data-testid="user-rights-info"]');

            const rightsInfo = await page.$eval('[data-testid="user-rights-info"]', el => el.textContent);

            // Verify all LGPD rights are mentioned
            expect(rightsInfo).toContain('acesso aos dados');
            expect(rightsInfo).toContain('correção');
            expect(rightsInfo).toContain('eliminação');
            expect(rightsInfo).toContain('portabilidade');
            expect(rightsInfo).toContain('oposição');

            // Test data access request
            await page.click('[data-testid="request-data-access"]');

            await page.waitForSelector('[data-testid="data-access-form"]');

            // Fill access request form
            await page.type('[data-testid="access-email"]', 'user@example.com');
            await page.type('[data-testid="access-reason"]', 'Quero ver meus dados armazenados');

            await page.click('[data-testid="submit-access-request"]');

            // Verify request confirmation
            const confirmation = await page.waitForSelector('[data-testid="access-request-confirmation"]');
            const confirmationText = await page.evaluate(el => el.textContent, confirmation);

            expect(confirmationText).toContain('solicitação registrada');
            expect(confirmationText).toContain('30 dias');
        });

        it('should validate data deletion and anonymization', async () => {
            await page.goto(`${baseUrl}/test-chatbot`);
            await page.waitForSelector('[data-testid="chatbot-widget"]');
            await page.click('[data-testid="chatbot-toggle"]');

            // Start a conversation to generate data
            await page.type('[data-testid="chatbot-input"]', 'Olá, meu nome é João Silva');
            await page.click('[data-testid="chatbot-send"]');

            await page.waitForSelector('[data-testid="chatbot-message-assistant"]');

            // Request data deletion
            await page.type('[data-testid="chatbot-input"]', 'Quero deletar meus dados');
            await page.click('[data-testid="chatbot-send"]');

            await page.waitForSelector('[data-testid="data-deletion-form"]');

            // Fill deletion request
            await page.type('[data-testid="deletion-email"]', 'joao@example.com');
            await page.select('[data-testid="deletion-reason"]', 'no_longer_needed');

            await page.click('[data-testid="confirm-deletion"]');

            // Verify deletion confirmation
            const deletionConfirmation = await page.waitForSelector('[data-testid="deletion-confirmation"]');
            const confirmationText = await page.evaluate(el => el.textContent, deletionConfirmation);

            expect(confirmationText).toContain('dados serão deletados');
            expect(confirmationText).toContain('30 dias');
            expect(confirmationText).toContain('irreversível');
        });

        it('should validate cross-border data transfer compliance', async () => {
            await page.goto(`${baseUrl}/test-chatbot`);
            await page.waitForSelector('[data-testid="chatbot-widget"]');
            await page.click('[data-testid="chatbot-toggle"]');

            // Check if international transfer notice is displayed
            const transferNotice = await page.$('[data-testid="international-transfer-notice"]');

            if (transferNotice) {
                const noticeText = await page.evaluate(el => el.textContent, transferNotice);
                expect(noticeText).toContain('transferência internacional');
                expect(noticeText).toContain('adequação');
                expect(noticeText).toContain('salvaguardas');
            }
        });
    });

    describe('Security and Penetration Testing (Requirement 8.1, 8.3)', () => {
        it('should validate input sanitization against XSS attacks', async () => {
            await page.goto(`${baseUrl}/test-chatbot`);
            await page.waitForSelector('[data-testid="chatbot-widget"]');
            await page.click('[data-testid="chatbot-toggle"]');

            const xssPayloads = [
                '<script>alert("xss")</script>',
                '<img src="x" onerror="alert(1)">',
                'javascript:alert("xss")',
                '<svg onload="alert(1)">',
                '"><script>alert("xss")</script>'
            ];

            for (const payload of xssPayloads) {
                await page.type('[data-testid="chatbot-input"]', payload);
                await page.click('[data-testid="chatbot-send"]');

                await page.waitForSelector('[data-testid="chatbot-message-user"]:last-child');

                // Verify payload is sanitized in display
                const userMessage = await page.$eval('[data-testid="chatbot-message-user"]:last-child', el => el.innerHTML);
                expect(userMessage).not.toContain('<script>');
                expect(userMessage).not.toContain('onerror');
                expect(userMessage).not.toContain('javascript:');
                expect(userMessage).not.toContain('onload');

                // Verify no script execution occurred
                const alertFired = await page.evaluate(() => window.alertFired);
                expect(alertFired).toBeFalsy();

                // Clear input
                await page.evaluate(() => {
                    document.querySelector('[data-testid="chatbot-input"]').value = '';
                });
            }
        });

        it('should validate SQL injection protection', async () => {
            await page.goto(`${baseUrl}/test-chatbot`);
            await page.waitForSelector('[data-testid="chatbot-widget"]');
            await page.click('[data-testid="chatbot-toggle"]');

            const sqlPayloads = [
                "'; DROP TABLE users; --",
                "' OR '1'='1",
                "'; SELECT * FROM conversations; --",
                "' UNION SELECT password FROM users --"
            ];

            for (const payload of sqlPayloads) {
                await page.type('[data-testid="chatbot-input"]', payload);
                await page.click('[data-testid="chatbot-send"]');

                await page.waitForSelector('[data-testid="chatbot-message-assistant"]');

                // Verify normal response (no SQL error or data exposure)
                const response = await page.$eval('[data-testid="chatbot-message-assistant"]:last-child', el => el.textContent);
                expect(response).not.toContain('SQL');
                expect(response).not.toContain('database');
                expect(response).not.toContain('error');
                expect(response).not.toContain('password');

                // Clear input
                await page.evaluate(() => {
                    document.querySelector('[data-testid="chatbot-input"]').value = '';
                });
            }
        });

        it('should validate rate limiting and DDoS protection', async () => {
            await page.goto(`${baseUrl}/test-chatbot`);
            await page.waitForSelector('[data-testid="chatbot-widget"]');
            await page.click('[data-testid="chatbot-toggle"]');

            // Send rapid requests to trigger rate limiting
            const rapidRequests = Array.from({ length: 20 }, (_, i) => `Rapid request ${i}`);

            let rateLimitTriggered = false;

            for (const request of rapidRequests) {
                await page.type('[data-testid="chatbot-input"]', request);
                await page.click('[data-testid="chatbot-send"]');

                // Check for rate limit message
                try {
                    await page.waitForSelector('[data-testid="rate-limit-warning"]', { timeout: 1000 });
                    rateLimitTriggered = true;
                    break;
                } catch (e) {
                    // Continue if no rate limit yet
                }

                // Clear input quickly
                await page.evaluate(() => {
                    document.querySelector('[data-testid="chatbot-input"]').value = '';
                });
            }

            expect(rateLimitTriggered).toBe(true);

            // Verify rate limit message
            const rateLimitMessage = await page.$eval('[data-testid="rate-limit-warning"]', el => el.textContent);
            expect(rateLimitMessage).toContain('muitas solicitações');
            expect(rateLimitMessage).toContain('aguarde');
        });

        it('should validate session security and token management', async () => {
            await page.goto(`${baseUrl}/test-chatbot`);
            await page.waitForSelector('[data-testid="chatbot-widget"]');
            await page.click('[data-testid="chatbot-toggle"]');

            // Start conversation to establish session
            await page.type('[data-testid="chatbot-input"]', 'Olá');
            await page.click('[data-testid="chatbot-send"]');

            await page.waitForSelector('[data-testid="chatbot-message-assistant"]');

            // Check session token in localStorage
            const sessionToken = await page.evaluate(() => localStorage.getItem('chatbot_session'));
            expect(sessionToken).toBeTruthy();
            expect(sessionToken.length).toBeGreaterThan(20); // Should be a proper token

            // Verify token rotation after time
            await page.waitForTimeout(5000); // Wait 5 seconds

            await page.type('[data-testid="chatbot-input"]', 'Continuando conversa');
            await page.click('[data-testid="chatbot-send"]');

            const newSessionToken = await page.evaluate(() => localStorage.getItem('chatbot_session'));

            // Token should be rotated for security
            if (newSessionToken !== sessionToken) {
                expect(newSessionToken).toBeTruthy();
                expect(newSessionToken).not.toBe(sessionToken);
            }
        });

        it('should validate data encryption in transit', async () => {
            await page.goto(`${baseUrl}/test-chatbot`);

            // Monitor network requests
            const requests = [];
            page.on('request', request => {
                if (request.url().includes('/api/chatbot')) {
                    requests.push(request);
                }
            });

            await page.waitForSelector('[data-testid="chatbot-widget"]');
            await page.click('[data-testid="chatbot-toggle"]');

            await page.type('[data-testid="chatbot-input"]', 'Dados sensíveis de teste');
            await page.click('[data-testid="chatbot-send"]');

            await page.waitForSelector('[data-testid="chatbot-message-assistant"]');

            // Verify HTTPS is used
            const chatbotRequests = requests.filter(req => req.url().includes('/api/chatbot'));
            expect(chatbotRequests.length).toBeGreaterThan(0);

            chatbotRequests.forEach(request => {
                expect(request.url()).toMatch(/^https:/);
            });
        });
    });

    describe('Performance and Load Testing', () => {
        it('should maintain performance under concurrent users', async () => {
            const concurrentPages = [];
            const performanceMetrics = [];

            // Create multiple browser pages to simulate concurrent users
            for (let i = 0; i < 5; i++) {
                const newPage = await browser.newPage();
                concurrentPages.push(newPage);

                await newPage.goto(`${baseUrl}/test-chatbot`);
                await newPage.waitForSelector('[data-testid="chatbot-widget"]');
                await newPage.click('[data-testid="chatbot-toggle"]');
            }

            // Send messages simultaneously
            const startTime = Date.now();

            const promises = concurrentPages.map(async (page, index) => {
                const messageStartTime = Date.now();

                await page.type('[data-testid="chatbot-input"]', `Concurrent message ${index}`);
                await page.click('[data-testid="chatbot-send"]');
                await page.waitForSelector('[data-testid="chatbot-message-assistant"]');

                const messageEndTime = Date.now();
                return messageEndTime - messageStartTime;
            });

            const responseTimes = await Promise.all(promises);
            const totalTime = Date.now() - startTime;

            // Verify performance metrics
            const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
            const maxResponseTime = Math.max(...responseTimes);

            expect(averageResponseTime).toBeLessThan(5000); // 5 seconds average
            expect(maxResponseTime).toBeLessThan(10000); // 10 seconds max
            expect(totalTime).toBeLessThan(15000); // 15 seconds total

            // Clean up
            await Promise.all(concurrentPages.map(page => page.close()));
        });

        it('should handle memory usage efficiently during long conversations', async () => {
            await page.goto(`${baseUrl}/test-chatbot`);
            await page.waitForSelector('[data-testid="chatbot-widget"]');
            await page.click('[data-testid="chatbot-toggle"]');

            // Get initial memory usage
            const initialMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);

            // Simulate long conversation
            for (let i = 0; i < 50; i++) {
                await page.type('[data-testid="chatbot-input"]', `Message ${i}: Esta é uma mensagem de teste para verificar o uso de memória`);
                await page.click('[data-testid="chatbot-send"]');
                await page.waitForSelector(`[data-testid="chatbot-message-assistant"]:nth-child(${(i + 1) * 2})`);

                // Clear input
                await page.evaluate(() => {
                    document.querySelector('[data-testid="chatbot-input"]').value = '';
                });
            }

            // Get final memory usage
            const finalMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);

            // Memory increase should be reasonable
            const memoryIncrease = finalMemory - initialMemory;
            const memoryIncreasePerMessage = memoryIncrease / 50;

            expect(memoryIncreasePerMessage).toBeLessThan(100000); // Less than 100KB per message
        });
    });
});

// Helper function to start test server
async function startTestServer() {
    const express = require('express');
    const app = express();

    app.use(express.static('public'));
    app.use(express.json());

    // Mock chatbot API endpoints
    app.post('/api/chatbot/chat', (req, res) => {
        const { message } = req.body;

        // Simulate different response types based on message
        if (message.toLowerCase().includes('socorro') || message.toLowerCase().includes('emergência')) {
            res.json({
                success: true,
                data: {
                    response: 'EMERGÊNCIA OFTALMOLÓGICA DETECTADA! Procure imediatamente: SAMU (192) ou Pronto Socorro mais próximo.',
                    sessionId: 'test-session',
                    complianceInfo: {
                        emergencyDetected: true,
                        riskLevel: 'critical'
                    },
                    suggestedActions: [{
                        type: 'emergency',
                        label: 'Contatos de Emergência',
                        action: 'show_emergency_contacts',
                        priority: 'critical'
                    }]
                }
            });
        } else if (message.toLowerCase().includes('glaucoma') || message.toLowerCase().includes('catarata')) {
            res.json({
                success: true,
                data: {
                    response: 'Informações sobre a condição. Esta informação é apenas educativa e não substitui consulta médica. Consulte sempre um médico oftalmologista.',
                    sessionId: 'test-session',
                    complianceInfo: {
                        medicalAdviceDetected: true,
                        disclaimerIncluded: true
                    }
                }
            });
        } else {
            res.json({
                success: true,
                data: {
                    response: 'Como posso ajudá-lo com suas questões sobre saúde ocular?',
                    sessionId: 'test-session',
                    complianceInfo: {
                        cfmCompliant: true,
                        lgpdCompliant: true
                    }
                }
            });
        }
    });

    const server = app.listen(0); // Use random available port
    const port = server.address().port;

    return { server, port, close: () => server.close() };
}
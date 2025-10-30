import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'

const mockResend = {
    emails: {
        send: vi.fn()
    }
}

vi.mock('resend', () => ({
    Resend: vi.fn(() => mockResend)
}))

vi.mock('fs', async () => {
    const actual = await vi.importActual('fs')
    return {
        ...actual,
        readFileSync: vi.fn()
    }
})

describe('Report Email Service', () => {
    let reportEmailService

    beforeEach(async () => {
        vi.clearAllMocks()
        
        process.env.RESEND_API_KEY = 'test-api-key'
        process.env.DOCTOR_EMAIL = 'doctor@saraivavision.com.br'
        
        reportEmailService = await import('../src/routes/reports/reportEmailService.js')
    })

    afterEach(() => {
        vi.resetAllMocks()
        delete process.env.RESEND_API_KEY
        delete process.env.DOCTOR_EMAIL
    })

    describe('sendSystemReportEmail', () => {
        it('should send report email successfully with valid data', async () => {
            const reportData = {
                generatedAt: '2024-01-15T10:00:00Z',
                status: 'success',
                durationSeconds: 120,
                results: [
                    { key: 'test1', label: 'Test 1', status: 'success', durationSeconds: 30 },
                    { key: 'test2', label: 'Test 2', status: 'success', durationSeconds: 40 },
                    { key: 'test3', label: 'Test 3', status: 'success', durationSeconds: 50 }
                ]
            }

            mockResend.emails.send.mockResolvedValue({
                data: { id: 'report-email-id-123' },
                error: null
            })

            const result = await reportEmailService.sendSystemReportEmail(reportData)

            expect(result.success).toBe(true)
            expect(result.messageId).toBe('report-email-id-123')
            expect(result.timestamp).toBeDefined()

            expect(mockResend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    from: 'Saraiva Vision Monitor <monitor@saraivavision.com.br>',
                    to: ['doctor@saraivavision.com.br'],
                    subject: expect.stringContaining('[✓] Relatório Diário do Sistema'),
                    html: expect.stringContaining('Saraiva Vision'),
                    text: expect.stringContaining('RELATÓRIO DIÁRIO DO SISTEMA'),
                    headers: expect.objectContaining({
                        'X-Priority': '3',
                        'X-Mailer': 'SaraivaVision-SystemMonitor',
                        'X-Report-Status': 'success'
                    })
                })
            )
        })

        it('should include failure status in email subject when report fails', async () => {
            const reportData = {
                generatedAt: '2024-01-15T10:00:00Z',
                status: 'failure',
                durationSeconds: 100,
                results: [
                    { key: 'test1', label: 'Test 1', status: 'success', durationSeconds: 30 },
                    { key: 'test2', label: 'Test 2', status: 'failure', durationSeconds: 40 }
                ]
            }

            mockResend.emails.send.mockResolvedValue({
                data: { id: 'report-email-id-456' },
                error: null
            })

            const result = await reportEmailService.sendSystemReportEmail(reportData)

            expect(result.success).toBe(true)
            expect(mockResend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    subject: expect.stringContaining('[✗] Relatório Diário do Sistema'),
                    headers: expect.objectContaining({
                        'X-Priority': '1',
                        'X-Report-Status': 'failure'
                    })
                })
            )
        })

        it('should display correct success rate in email', async () => {
            const reportData = {
                generatedAt: '2024-01-15T10:00:00Z',
                status: 'failure',
                durationSeconds: 100,
                results: [
                    { key: 'test1', label: 'Test 1', status: 'success', durationSeconds: 10 },
                    { key: 'test2', label: 'Test 2', status: 'success', durationSeconds: 10 },
                    { key: 'test3', label: 'Test 3', status: 'failure', durationSeconds: 10 },
                    { key: 'test4', label: 'Test 4', status: 'failure', durationSeconds: 10 }
                ]
            }

            mockResend.emails.send.mockResolvedValue({
                data: { id: 'test-id' },
                error: null
            })

            await reportEmailService.sendSystemReportEmail(reportData)

            const emailCall = mockResend.emails.send.mock.calls[0][0]
            expect(emailCall.html).toContain('50.0%')
            expect(emailCall.text).toContain('50.0%')
        })

        it('should sanitize malicious content in report data', async () => {
            const reportData = {
                generatedAt: '2024-01-15T10:00:00Z',
                status: 'success',
                durationSeconds: 50,
                results: [
                    { key: 'test1', label: '<script>alert("xss")</script> Test', status: 'success', durationSeconds: 50 }
                ]
            }

            mockResend.emails.send.mockResolvedValue({
                data: { id: 'test-id' },
                error: null
            })

            await reportEmailService.sendSystemReportEmail(reportData)

            const emailCall = mockResend.emails.send.mock.calls[0][0]
            expect(emailCall.html).not.toContain('<script>')
        })

        it('should throw error when report data is missing', async () => {
            await expect(
                reportEmailService.sendSystemReportEmail(null)
            ).rejects.toThrow('Invalid report data: results are required')

            await expect(
                reportEmailService.sendSystemReportEmail({ status: 'success' })
            ).rejects.toThrow('Invalid report data: results are required')
        })

        it('should retry on transient failures', async () => {
            const reportData = {
                generatedAt: '2024-01-15T10:00:00Z',
                status: 'success',
                durationSeconds: 50,
                results: [
                    { key: 'test1', label: 'Test 1', status: 'success', durationSeconds: 50 }
                ]
            }

            mockResend.emails.send
                .mockRejectedValueOnce(new Error('Network timeout'))
                .mockResolvedValue({
                    data: { id: 'success-after-retry' },
                    error: null
                })

            const result = await reportEmailService.sendSystemReportEmail(reportData)

            expect(result.success).toBe(true)
            expect(result.messageId).toBe('success-after-retry')
            expect(mockResend.emails.send).toHaveBeenCalledTimes(2)
        })

        it('should fail after maximum retry attempts', async () => {
            const reportData = {
                generatedAt: '2024-01-15T10:00:00Z',
                status: 'success',
                durationSeconds: 50,
                results: [
                    { key: 'test1', label: 'Test 1', status: 'success', durationSeconds: 50 }
                ]
            }

            mockResend.emails.send.mockRejectedValue(new Error('Persistent error'))

            const result = await reportEmailService.sendSystemReportEmail(reportData)

            expect(result.success).toBe(false)
            expect(result.error.code).toBe('EMAIL_SEND_FAILED')
            expect(mockResend.emails.send).toHaveBeenCalledTimes(3)
        })

        it('should handle Resend API errors', async () => {
            const reportData = {
                generatedAt: '2024-01-15T10:00:00Z',
                status: 'success',
                durationSeconds: 50,
                results: [
                    { key: 'test1', label: 'Test 1', status: 'success', durationSeconds: 50 }
                ]
            }

            mockResend.emails.send.mockResolvedValue({
                data: null,
                error: { message: 'API key is invalid' }
            })

            const result = await reportEmailService.sendSystemReportEmail(reportData)

            expect(result.success).toBe(false)
            expect(result.error.details).toContain('API key is invalid')
        })
    })

    describe('sendReportFromFile', () => {
        it('should handle file read errors', async () => {
            vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
                throw new Error('File not found')
            })

            const result = await reportEmailService.sendReportFromFile('/invalid/path.json')

            expect(result.success).toBe(false)
            expect(result.error.code).toBe('FILE_READ_ERROR')
        })

        it('should handle invalid JSON in file', async () => {
            vi.spyOn(fs, 'readFileSync').mockReturnValue('invalid json content')

            const result = await reportEmailService.sendReportFromFile('/path/to/report.json')

            expect(result.success).toBe(false)
            expect(result.error.code).toBe('FILE_READ_ERROR')
        })
    })

    describe('validateReportEmailConfig', () => {
        it('should validate correct configuration', () => {
            process.env.RESEND_API_KEY = 'test-key'
            process.env.DOCTOR_EMAIL = 'doctor@example.com'

            const result = reportEmailService.validateReportEmailConfig()

            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it('should detect missing RESEND_API_KEY', () => {
            delete process.env.RESEND_API_KEY
            process.env.DOCTOR_EMAIL = 'doctor@example.com'

            const result = reportEmailService.validateReportEmailConfig()

            expect(result.isValid).toBe(false)
            expect(result.errors).toContain('RESEND_API_KEY environment variable is not set')
        })

        it('should detect missing DOCTOR_EMAIL', () => {
            process.env.RESEND_API_KEY = 'test-key'
            delete process.env.DOCTOR_EMAIL

            const result = reportEmailService.validateReportEmailConfig()

            expect(result.isValid).toBe(false)
            expect(result.errors).toContain('DOCTOR_EMAIL environment variable is not set')
        })
    })

    describe('Email Templates', () => {
        it('should generate HTML template with proper structure', async () => {
            const reportData = {
                generatedAt: '2024-01-15T10:00:00Z',
                status: 'success',
                durationSeconds: 120,
                results: [
                    { key: 'test1', label: 'Node.js versão', status: 'success', durationSeconds: 2 },
                    { key: 'test2', label: 'Linting', status: 'success', durationSeconds: 30 }
                ]
            }

            mockResend.emails.send.mockResolvedValue({
                data: { id: 'test-id' },
                error: null
            })

            await reportEmailService.sendSystemReportEmail(reportData)

            const emailCall = mockResend.emails.send.mock.calls[0][0]
            
            expect(emailCall.html).toContain('<!DOCTYPE html>')
            expect(emailCall.html).toContain('Saraiva Vision')
            expect(emailCall.html).toContain('Relatório Diário do Sistema')
            expect(emailCall.html).toContain('Node.js versão')
            expect(emailCall.html).toContain('Linting')
            expect(emailCall.html).toContain('120s')
        })

        it('should include summary section if provided', async () => {
            const reportData = {
                generatedAt: '2024-01-15T10:00:00Z',
                status: 'failure',
                durationSeconds: 100,
                results: [
                    { key: 'test1', label: 'Test 1', status: 'failure', durationSeconds: 100 }
                ],
                summary: 'Build failed due to linting errors'
            }

            mockResend.emails.send.mockResolvedValue({
                data: { id: 'test-id' },
                error: null
            })

            await reportEmailService.sendSystemReportEmail(reportData)

            const emailCall = mockResend.emails.send.mock.calls[0][0]
            expect(emailCall.html).toContain('Observações')
            expect(emailCall.html).toContain('Build failed due to linting errors')
        })

        it('should display proper status icons and colors', async () => {
            const reportData = {
                generatedAt: '2024-01-15T10:00:00Z',
                status: 'success',
                durationSeconds: 50,
                results: [
                    { key: 'test1', label: 'Test 1', status: 'success', durationSeconds: 25 },
                    { key: 'test2', label: 'Test 2', status: 'failure', durationSeconds: 25 }
                ]
            }

            mockResend.emails.send.mockResolvedValue({
                data: { id: 'test-id' },
                error: null
            })

            await reportEmailService.sendSystemReportEmail(reportData)

            const emailCall = mockResend.emails.send.mock.calls[0][0]
            expect(emailCall.html).toContain('✓')
            expect(emailCall.html).toContain('✗')
            expect(emailCall.html).toContain('#10b981')
            expect(emailCall.html).toContain('#ef4444')
        })
    })
})

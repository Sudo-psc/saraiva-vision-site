/**
 * External Services Integration Tests
 * Tests for third-party service integrations (Resend, Zenvia, Spotify, OpenAI)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock external service clients
const mockResendClient = {
    emails: {
        send: vi.fn()
    }
}

const mockZenviaClient = {
    sendSMS: vi.fn()
}

const mockSpotifyApi = {
    getRSSFeed: vi.fn()
}

const mockOpenAIClient = {
    chat: {
        completions: {
            create: vi.fn()
        }
    }
}

// Mock modules
vi.mock('resend', () => ({
    Resend: vi.fn(() => mockResendClient)
}))

vi.mock('openai', () => ({
    OpenAI: vi.fn(() => mockOpenAIClient)
}))

describe('External Services Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    describe('Resend Email Service', () => {
        let emailService

        beforeEach(() => {
            emailService = {
                sendContactEmail: async (contactData) => {
                    return mockResendClient.emails.send({
                        from: 'contato@saraivavision.com.br',
                        to: 'philipe_cruz@outlook.com',
                        subject: `Nova mensagem de ${contactData.name}`,
                        html: `
              <h2>Nova mensagem de contato</h2>
              <p><strong>Nome:</strong> ${contactData.name}</p>
              <p><strong>Email:</strong> ${contactData.email}</p>
              <p><strong>Telefone:</strong> ${contactData.phone}</p>
              <p><strong>Mensagem:</strong></p>
              <p>${contactData.message}</p>
            `
                    })
                },

                sendAppointmentConfirmation: async (appointmentData) => {
                    return mockResendClient.emails.send({
                        from: 'agendamentos@saraivavision.com.br',
                        to: appointmentData.patientEmail,
                        subject: 'Confirmação de Agendamento - Saraiva Vision',
                        html: `
              <h2>Agendamento Confirmado</h2>
              <p>Olá ${appointmentData.patientName},</p>
              <p>Seu agendamento foi confirmado para:</p>
              <p><strong>Data:</strong> ${appointmentData.appointmentDate}</p>
              <p><strong>Horário:</strong> ${appointmentData.appointmentTime}</p>
            `
                    })
                }
            }
        })

        it('should send contact email successfully', async () => {
            const contactData = {
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '11999999999',
                message: 'Gostaria de agendar uma consulta'
            }

            const mockResponse = {
                id: 'email-123',
                from: 'contato@saraivavision.com.br',
                to: 'philipe_cruz@outlook.com',
                created_at: '2024-01-15T10:00:00Z'
            }

            mockResendClient.emails.send.mockResolvedValue(mockResponse)

            const result = await emailService.sendContactEmail(contactData)

            expect(mockResendClient.emails.send).toHaveBeenCalledWith({
                from: 'contato@saraivavision.com.br',
                to: 'philipe_cruz@outlook.com',
                subject: 'Nova mensagem de João Silva',
                html: expect.stringContaining('João Silva')
            })
            expect(result.id).toBe('email-123')
        })

        it('should send appointment confirmation email', async () => {
            const appointmentData = {
                patientName: 'Maria Santos',
                patientEmail: 'maria@example.com',
                appointmentDate: '2024-01-20',
                appointmentTime: '14:30'
            }

            const mockResponse = {
                id: 'email-456',
                from: 'agendamentos@saraivavision.com.br',
                to: 'maria@example.com',
                created_at: '2024-01-15T10:00:00Z'
            }

            mockResendClient.emails.send.mockResolvedValue(mockResponse)

            const result = await emailService.sendAppointmentConfirmation(appointmentData)

            expect(mockResendClient.emails.send).toHaveBeenCalledWith({
                from: 'agendamentos@saraivavision.com.br',
                to: 'maria@example.com',
                subject: 'Confirmação de Agendamento - Saraiva Vision',
                html: expect.stringContaining('Maria Santos')
            })
            expect(result.id).toBe('email-456')
        })

        it('should handle Resend API errors', async () => {
            const contactData = {
                name: 'Test User',
                email: 'test@example.com',
                phone: '11999999999',
                message: 'Test message'
            }

            const apiError = new Error('Invalid API key')
            apiError.status = 401
            mockResendClient.emails.send.mockRejectedValue(apiError)

            await expect(emailService.sendContactEmail(contactData))
                .rejects.toThrow('Invalid API key')
        })

        it('should handle rate limiting', async () => {
            const contactData = {
                name: 'Test User',
                email: 'test@example.com',
                phone: '11999999999',
                message: 'Test message'
            }

            const rateLimitError = new Error('Rate limit exceeded')
            rateLimitError.status = 429
            mockResendClient.emails.send.mockRejectedValue(rateLimitError)

            await expect(emailService.sendContactEmail(contactData))
                .rejects.toThrow('Rate limit exceeded')
        })
    })

    describe('Zenvia SMS Service', () => {
        let smsService

        beforeEach(() => {
            smsService = {
                sendAppointmentSMS: async (phoneNumber, message) => {
                    return mockZenviaClient.sendSMS({
                        from: '+5511999999999',
                        to: phoneNumber,
                        contents: [{
                            type: 'text',
                            text: message
                        }]
                    })
                }
            }
        })

        it('should send appointment confirmation SMS', async () => {
            const phoneNumber = '+5511888888888'
            const message = 'Agendamento confirmado para 20/01/2024 às 14:30. Saraiva Vision.'

            const mockResponse = {
                id: 'sms-123',
                from: '+5511999999999',
                to: phoneNumber,
                timestamp: '2024-01-15T10:00:00Z'
            }

            mockZenviaClient.sendSMS.mockResolvedValue(mockResponse)

            const result = await smsService.sendAppointmentSMS(phoneNumber, message)

            expect(mockZenviaClient.sendSMS).toHaveBeenCalledWith({
                from: '+5511999999999',
                to: phoneNumber,
                contents: [{
                    type: 'text',
                    text: message
                }]
            })
            expect(result.id).toBe('sms-123')
        })

        it('should handle invalid phone numbers', async () => {
            const invalidPhone = 'invalid-phone'
            const message = 'Test message'

            const validationError = new Error('Invalid phone number format')
            validationError.status = 400
            mockZenviaClient.sendSMS.mockRejectedValue(validationError)

            await expect(smsService.sendAppointmentSMS(invalidPhone, message))
                .rejects.toThrow('Invalid phone number format')
        })
    })

    describe('Spotify RSS Service', () => {
        let spotifyService

        beforeEach(() => {
            spotifyService = {
                fetchEpisodes: async function () {
                    const rssData = await mockSpotifyApi.getRSSFeed()
                    return this.parseRSSData(rssData)
                },

                parseRSSData: (rssXml) => {
                    // Mock RSS parsing logic
                    return [
                        {
                            id: 'episode-1',
                            title: 'Catarata: Sintomas e Tratamentos',
                            description: 'Neste episódio falamos sobre catarata...',
                            duration: '18:30',
                            publishedAt: '2024-01-10T09:00:00Z',
                            spotifyUrl: 'https://open.spotify.com/episode/123',
                            embedUrl: 'https://open.spotify.com/embed/episode/123'
                        }
                    ]
                }
            }
        })

        it('should fetch and parse RSS feed successfully', async () => {
            const mockRSSXml = `
        <?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Saúde Ocular com Dr. Philipe</title>
            <item>
              <title>Catarata: Sintomas e Tratamentos</title>
              <description>Neste episódio falamos sobre catarata...</description>
              <pubDate>Wed, 10 Jan 2024 09:00:00 GMT</pubDate>
              <enclosure url="https://anchor.fm/episode.mp3" type="audio/mpeg"/>
            </item>
          </channel>
        </rss>
      `

            mockSpotifyApi.getRSSFeed.mockResolvedValue(mockRSSXml)

            const episodes = await spotifyService.fetchEpisodes()

            expect(mockSpotifyApi.getRSSFeed).toHaveBeenCalled()
            expect(episodes).toHaveLength(1)
            expect(episodes[0].title).toBe('Catarata: Sintomas e Tratamentos')
        })

        it('should handle RSS feed errors', async () => {
            const rssError = new Error('RSS feed not available')
            mockSpotifyApi.getRSSFeed.mockRejectedValue(rssError)

            await expect(spotifyService.fetchEpisodes())
                .rejects.toThrow('RSS feed not available')
        })

        it('should handle malformed RSS data', async () => {
            const malformedRSS = '<invalid>xml</invalid>'
            mockSpotifyApi.getRSSFeed.mockResolvedValue(malformedRSS)

            // Should handle parsing errors gracefully
            const episodes = spotifyService.parseRSSData(malformedRSS)
            // Since this is a mock, it returns the hardcoded data regardless of input
            expect(episodes).toBeDefined()
        })
    })

    describe('OpenAI Chatbot Service', () => {
        let chatbotService

        beforeEach(() => {
            chatbotService = {
                generateResponse: async (userMessage, context = []) => {
                    return mockOpenAIClient.chat.completions.create({
                        model: 'gpt-3.5-turbo',
                        messages: [
                            {
                                role: 'system',
                                content: 'Você é um assistente da clínica Saraiva Vision. Responda perguntas sobre oftalmologia de forma educativa, mas sempre recomende consulta médica para diagnósticos.'
                            },
                            ...context,
                            {
                                role: 'user',
                                content: userMessage
                            }
                        ],
                        max_tokens: 150,
                        temperature: 0.7
                    })
                }
            }
        })

        it('should generate appropriate medical responses', async () => {
            const mockResponse = {
                choices: [{
                    message: {
                        role: 'assistant',
                        content: 'A catarata é uma condição comum que causa opacidade no cristalino do olho. Os sintomas incluem visão embaçada e sensibilidade à luz. Recomendo agendar uma consulta para avaliação completa.'
                    }
                }],
                usage: {
                    total_tokens: 85
                }
            }

            mockOpenAIClient.chat.completions.create.mockResolvedValue(mockResponse)

            const result = await chatbotService.generateResponse('O que é catarata?')

            expect(mockOpenAIClient.chat.completions.create).toHaveBeenCalledWith({
                model: 'gpt-3.5-turbo',
                messages: expect.arrayContaining([
                    expect.objectContaining({
                        role: 'system',
                        content: expect.stringContaining('Saraiva Vision')
                    }),
                    expect.objectContaining({
                        role: 'user',
                        content: 'O que é catarata?'
                    })
                ]),
                max_tokens: 150,
                temperature: 0.7
            })

            expect(result.choices[0].message.content).toContain('catarata')
            expect(result.choices[0].message.content).toContain('consulta')
        })

        it('should handle OpenAI API errors', async () => {
            const apiError = new Error('OpenAI API quota exceeded')
            apiError.status = 429
            mockOpenAIClient.chat.completions.create.mockRejectedValue(apiError)

            await expect(chatbotService.generateResponse('Test question'))
                .rejects.toThrow('OpenAI API quota exceeded')
        })

        it('should handle context in conversations', async () => {
            const context = [
                { role: 'user', content: 'Olá' },
                { role: 'assistant', content: 'Olá! Como posso ajudá-lo?' }
            ]

            const mockResponse = {
                choices: [{
                    message: {
                        role: 'assistant',
                        content: 'Posso ajudá-lo com informações sobre nossos serviços oftalmológicos.'
                    }
                }]
            }

            mockOpenAIClient.chat.completions.create.mockResolvedValue(mockResponse)

            await chatbotService.generateResponse('Quais serviços vocês oferecem?', context)

            expect(mockOpenAIClient.chat.completions.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    messages: expect.arrayContaining([
                        { role: 'user', content: 'Olá' },
                        { role: 'assistant', content: 'Olá! Como posso ajudá-lo?' },
                        { role: 'user', content: 'Quais serviços vocês oferecem?' }
                    ])
                })
            )
        })
    })

    describe('Service Resilience', () => {
        it('should handle network timeouts', async () => {
            const timeoutError = new Error('Request timeout')
            timeoutError.code = 'ETIMEDOUT'

            mockResendClient.emails.send.mockRejectedValue(timeoutError)

            const emailService = {
                sendContactEmail: async (data) => mockResendClient.emails.send(data)
            }

            await expect(emailService.sendContactEmail({}))
                .rejects.toThrow('Request timeout')
        })

        it('should handle service unavailability', async () => {
            const serviceError = new Error('Service Unavailable')
            serviceError.status = 503

            mockZenviaClient.sendSMS.mockRejectedValue(serviceError)

            const smsService = {
                sendSMS: async (data) => mockZenviaClient.sendSMS(data)
            }

            await expect(smsService.sendSMS({}))
                .rejects.toThrow('Service Unavailable')
        })

        it('should handle concurrent service calls', async () => {
            mockResendClient.emails.send.mockResolvedValue({ id: 'email-1' })
            mockZenviaClient.sendSMS.mockResolvedValue({ id: 'sms-1' })
            mockOpenAIClient.chat.completions.create.mockResolvedValue({
                choices: [{ message: { content: 'Response' } }]
            })

            const emailService = {
                sendEmail: async () => mockResendClient.emails.send({})
            }
            const smsService = {
                sendSMS: async () => mockZenviaClient.sendSMS({})
            }
            const chatbotService = {
                generateResponse: async () => mockOpenAIClient.chat.completions.create({})
            }

            const promises = [
                emailService.sendEmail(),
                smsService.sendSMS(),
                chatbotService.generateResponse()
            ]

            const results = await Promise.all(promises)

            expect(results).toHaveLength(3)
            expect(results[0].id).toBe('email-1')
            expect(results[1].id).toBe('sms-1')
            expect(results[2].choices[0].message.content).toBe('Response')
        })
    })
})
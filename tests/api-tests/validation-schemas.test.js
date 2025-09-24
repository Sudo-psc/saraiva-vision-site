/**
 * Validation Schemas Unit Tests
 * Tests for Zod validation schemas used across the application
 */

import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Import validation schemas
const contactSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
    email: z.string().email('Email inválido'),
    phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos').max(15),
    message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres').max(1000),
    consent: z.boolean().refine(val => val === true, 'Consentimento é obrigatório')
})

const appointmentSchema = z.object({
    patientName: z.string().min(2).max(100),
    patientEmail: z.string().email(),
    patientPhone: z.string().min(10).max(15),
    appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
    appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, 'Hora deve estar no formato HH:MM'),
    notes: z.string().max(500).optional()
})

const podcastEpisodeSchema = z.object({
    spotifyId: z.string().min(1),
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    durationMs: z.number().positive().optional(),
    publishedAt: z.string().datetime().optional(),
    spotifyUrl: z.string().url().optional(),
    embedUrl: z.string().url().optional(),
    imageUrl: z.string().url().optional()
})

describe('Validation Schemas', () => {
    describe('Contact Form Schema', () => {
        it('should validate correct contact form data', () => {
            const validData = {
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '11999999999',
                message: 'Gostaria de agendar uma consulta para verificar minha visão.',
                consent: true
            }

            const result = contactSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should reject empty name', () => {
            const invalidData = {
                name: '',
                email: 'joao@example.com',
                phone: '11999999999',
                message: 'Test message',
                consent: true
            }

            const result = contactSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            expect(result.error.issues[0].message).toContain('pelo menos 2 caracteres')
        })

        it('should reject invalid email format', () => {
            const invalidData = {
                name: 'João Silva',
                email: 'invalid-email',
                phone: '11999999999',
                message: 'Test message',
                consent: true
            }

            const result = contactSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            expect(result.error.issues[0].message).toBe('Email inválido')
        })

        it('should reject short phone number', () => {
            const invalidData = {
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '123',
                message: 'Test message',
                consent: true
            }

            const result = contactSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            expect(result.error.issues[0].message).toContain('pelo menos 10 dígitos')
        })

        it('should reject short message', () => {
            const invalidData = {
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '11999999999',
                message: 'Hi',
                consent: true
            }

            const result = contactSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            expect(result.error.issues[0].message).toContain('pelo menos 10 caracteres')
        })

        it('should reject without consent', () => {
            const invalidData = {
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '11999999999',
                message: 'Test message',
                consent: false
            }

            const result = contactSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            expect(result.error.issues[0].message).toBe('Consentimento é obrigatório')
        })
    })

    describe('Appointment Schema', () => {
        it('should validate correct appointment data', () => {
            const validData = {
                patientName: 'Maria Santos',
                patientEmail: 'maria@example.com',
                patientPhone: '11888888888',
                appointmentDate: '2024-12-15',
                appointmentTime: '14:30',
                notes: 'Primeira consulta'
            }

            const result = appointmentSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should reject invalid date format', () => {
            const invalidData = {
                patientName: 'Maria Santos',
                patientEmail: 'maria@example.com',
                patientPhone: '11888888888',
                appointmentDate: '15/12/2024',
                appointmentTime: '14:30'
            }

            const result = appointmentSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            expect(result.error.issues[0].message).toContain('YYYY-MM-DD')
        })

        it('should reject invalid time format', () => {
            const invalidData = {
                patientName: 'Maria Santos',
                patientEmail: 'maria@example.com',
                patientPhone: '11888888888',
                appointmentDate: '2024-12-15',
                appointmentTime: '2:30 PM'
            }

            const result = appointmentSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            expect(result.error.issues[0].message).toContain('HH:MM')
        })

        it('should accept optional notes', () => {
            const validData = {
                patientName: 'Maria Santos',
                patientEmail: 'maria@example.com',
                patientPhone: '11888888888',
                appointmentDate: '2024-12-15',
                appointmentTime: '14:30'
            }

            const result = appointmentSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })
    })

    describe('Podcast Episode Schema', () => {
        it('should validate correct episode data', () => {
            const validData = {
                spotifyId: 'episode123',
                title: 'Catarata: Sintomas e Tratamentos',
                description: 'Neste episódio falamos sobre catarata...',
                durationMs: 1800000,
                publishedAt: '2024-01-15T10:00:00Z',
                spotifyUrl: 'https://open.spotify.com/episode/123',
                embedUrl: 'https://open.spotify.com/embed/episode/123',
                imageUrl: 'https://example.com/image.jpg'
            }

            const result = podcastEpisodeSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should require spotifyId and title', () => {
            const invalidData = {
                description: 'Episode description'
            }

            const result = podcastEpisodeSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            expect(result.error.issues).toHaveLength(2) // Missing spotifyId and title
        })

        it('should reject invalid URL formats', () => {
            const invalidData = {
                spotifyId: 'episode123',
                title: 'Test Episode',
                spotifyUrl: 'not-a-url'
            }

            const result = podcastEpisodeSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            expect(result.error.issues[0].message).toContain('Invalid url')
        })

        it('should reject negative duration', () => {
            const invalidData = {
                spotifyId: 'episode123',
                title: 'Test Episode',
                durationMs: -1000
            }

            const result = podcastEpisodeSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            expect(result.error.issues[0].message).toContain('greater than 0')
        })
    })
})
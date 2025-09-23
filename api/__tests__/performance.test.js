/**
 * Performance Tests
 * Tests for appointment availability calculation and concurrent bookings
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { performance } from 'perf_hooks'

// Mock database operations
const mockDatabase = {
    appointments: [],

    async getAppointments(date) {
        // Simulate database query delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 10))
        return this.appointments.filter(apt => apt.appointment_date === date)
    },

    async createAppointment(appointmentData) {
        // Simulate database write delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 20))

        // Check for conflicts
        const existing = this.appointments.find(apt =>
            apt.appointment_date === appointmentData.appointment_date &&
            apt.appointment_time === appointmentData.appointment_time
        )

        if (existing) {
            throw new Error('Appointment conflict')
        }

        const appointment = {
            id: `apt-${Date.now()}-${Math.random()}`,
            ...appointmentData,
            created_at: new Date().toISOString()
        }

        this.appointments.push(appointment)
        return appointment
    },

    async reset() {
        this.appointments = []
    }
}

// Appointment availability calculation
const calculateAvailability = async (date, existingAppointments = []) => {
    const startTime = performance.now()

    const slots = []
    const startHour = 8
    const endHour = 18
    const slotDuration = 30 // minutes

    // Generate all possible slots
    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotDuration) {
            const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

            // Check if slot is available
            const isBooked = existingAppointments.some(apt => apt.appointment_time === timeSlot)

            if (!isBooked) {
                slots.push(timeSlot)
            }
        }
    }

    const endTime = performance.now()
    const executionTime = endTime - startTime

    return {
        availableSlots: slots,
        executionTime,
        totalSlots: (endHour - startHour) * 2, // 30-minute slots
        availableCount: slots.length
    }
}

// Concurrent booking simulation
const simulateConcurrentBookings = async (bookingRequests) => {
    const startTime = performance.now()
    const results = []

    // Execute all bookings concurrently
    const promises = bookingRequests.map(async (request, index) => {
        try {
            const appointment = await mockDatabase.createAppointment({
                ...request,
                patient_name: `Patient ${index + 1}`,
                patient_email: `patient${index + 1}@example.com`,
                patient_phone: `1199999999${index}`
            })

            return {
                success: true,
                appointmentId: appointment.id,
                requestIndex: index
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                requestIndex: index
            }
        }
    })

    const bookingResults = await Promise.all(promises)
    const endTime = performance.now()

    return {
        results: bookingResults,
        executionTime: endTime - startTime,
        successCount: bookingResults.filter(r => r.success).length,
        conflictCount: bookingResults.filter(r => !r.success).length
    }
}

describe('Performance Tests', () => {
    beforeEach(async () => {
        await mockDatabase.reset()
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('Appointment Availability Calculation', () => {
        it('should calculate availability for empty schedule within performance threshold', async () => {
            const date = '2024-01-20'
            const result = await calculateAvailability(date, [])

            // Should complete within 50ms for empty schedule
            expect(result.executionTime).toBeLessThan(50)
            expect(result.availableSlots).toHaveLength(20) // 10 hours * 2 slots per hour
            expect(result.availableCount).toBe(result.totalSlots)
        })

        it('should calculate availability with existing appointments efficiently', async () => {
            const date = '2024-01-20'
            const existingAppointments = [
                { appointment_time: '09:00' },
                { appointment_time: '09:30' },
                { appointment_time: '14:00' },
                { appointment_time: '14:30' },
                { appointment_time: '15:00' }
            ]

            const result = await calculateAvailability(date, existingAppointments)

            // Should complete within 50ms even with existing appointments
            expect(result.executionTime).toBeLessThan(50)
            expect(result.availableCount).toBe(result.totalSlots - existingAppointments.length)
            expect(result.availableSlots).not.toContain('09:00')
            expect(result.availableSlots).not.toContain('14:00')
        })

        it('should handle fully booked schedule efficiently', async () => {
            const date = '2024-01-20'
            const fullyBookedAppointments = []

            // Create appointments for all slots
            for (let hour = 8; hour < 18; hour++) {
                for (let minute = 0; minute < 60; minute += 30) {
                    fullyBookedAppointments.push({
                        appointment_time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                    })
                }
            }

            const result = await calculateAvailability(date, fullyBookedAppointments)

            expect(result.executionTime).toBeLessThan(100)
            expect(result.availableCount).toBe(0)
            expect(result.availableSlots).toHaveLength(0)
        })

        it('should perform well with large number of existing appointments', async () => {
            const date = '2024-01-20'
            const manyAppointments = Array.from({ length: 100 }, (_, i) => ({
                appointment_time: `${(8 + Math.floor(i / 10)).toString().padStart(2, '0')}:${((i % 2) * 30).toString().padStart(2, '0')}`
            }))

            const result = await calculateAvailability(date, manyAppointments)

            // Should still complete quickly even with many appointments
            expect(result.executionTime).toBeLessThan(200)
        })
    })

    describe('Concurrent Booking Performance', () => {
        it('should handle multiple concurrent bookings for different slots', async () => {
            const bookingRequests = [
                { appointment_date: '2024-01-20', appointment_time: '09:00' },
                { appointment_date: '2024-01-20', appointment_time: '09:30' },
                { appointment_date: '2024-01-20', appointment_time: '10:00' },
                { appointment_date: '2024-01-20', appointment_time: '14:00' },
                { appointment_date: '2024-01-20', appointment_time: '14:30' }
            ]

            const result = await simulateConcurrentBookings(bookingRequests)

            // All bookings should succeed (different slots)
            expect(result.successCount).toBe(5)
            expect(result.conflictCount).toBe(0)

            // Should complete within reasonable time
            expect(result.executionTime).toBeLessThan(500)
        })

        it('should handle concurrent bookings for same slot (conflict detection)', async () => {
            const sameSlotRequests = Array.from({ length: 10 }, () => ({
                appointment_date: '2024-01-20',
                appointment_time: '09:00'
            }))

            const result = await simulateConcurrentBookings(sameSlotRequests)

            // Only one booking should succeed, others should conflict
            expect(result.successCount).toBe(1)
            expect(result.conflictCount).toBe(9)

            // Should handle conflicts efficiently
            expect(result.executionTime).toBeLessThan(1000)
        })

        it('should handle mixed concurrent bookings (some conflicts, some success)', async () => {
            const mixedRequests = [
                { appointment_date: '2024-01-20', appointment_time: '09:00' },
                { appointment_date: '2024-01-20', appointment_time: '09:00' }, // Conflict
                { appointment_date: '2024-01-20', appointment_time: '09:30' },
                { appointment_date: '2024-01-20', appointment_time: '09:30' }, // Conflict
                { appointment_date: '2024-01-20', appointment_time: '10:00' },
                { appointment_date: '2024-01-20', appointment_time: '14:00' }
            ]

            const result = await simulateConcurrentBookings(mixedRequests)

            // Should have 4 successes and 2 conflicts
            expect(result.successCount).toBe(4)
            expect(result.conflictCount).toBe(2)
        })

        it('should scale with high concurrent load', async () => {
            // Generate 50 concurrent booking requests
            const highLoadRequests = Array.from({ length: 50 }, (_, i) => ({
                appointment_date: '2024-01-20',
                appointment_time: `${(8 + Math.floor(i / 2)).toString().padStart(2, '0')}:${((i % 2) * 30).toString().padStart(2, '0')}`
            }))

            const result = await simulateConcurrentBookings(highLoadRequests)

            // Should handle high load within reasonable time (5 seconds)
            expect(result.executionTime).toBeLessThan(5000)

            // Should have some successes (exact number depends on slot distribution)
            expect(result.successCount).toBeGreaterThan(0)
            expect(result.successCount + result.conflictCount).toBe(50)
        })
    })

    describe('Database Performance Simulation', () => {
        it('should measure database query performance', async () => {
            // Pre-populate database with appointments
            const appointments = Array.from({ length: 100 }, (_, i) => ({
                id: `apt-${i}`,
                appointment_date: '2024-01-20',
                appointment_time: `${(8 + Math.floor(i / 10)).toString().padStart(2, '0')}:30`,
                patient_name: `Patient ${i}`,
                created_at: new Date().toISOString()
            }))

            mockDatabase.appointments = appointments

            const startTime = performance.now()
            const result = await mockDatabase.getAppointments('2024-01-20')
            const endTime = performance.now()

            const queryTime = endTime - startTime

            // Database query should be fast
            expect(queryTime).toBeLessThan(100)
            expect(result.length).toBeGreaterThan(0)
        })

        it('should measure database write performance under load', async () => {
            const writeOperations = Array.from({ length: 20 }, (_, i) => ({
                appointment_date: '2024-01-21',
                appointment_time: `${(8 + Math.floor(i / 2)).toString().padStart(2, '0')}:${((i % 2) * 30).toString().padStart(2, '0')}`
            }))

            const startTime = performance.now()

            const results = await Promise.all(
                writeOperations.map(async (operation, index) => {
                    try {
                        return await mockDatabase.createAppointment({
                            ...operation,
                            patient_name: `Patient ${index}`,
                            patient_email: `patient${index}@example.com`
                        })
                    } catch (error) {
                        return { error: error.message }
                    }
                })
            )

            const endTime = performance.now()
            const totalTime = endTime - startTime

            // Should complete all writes within reasonable time
            expect(totalTime).toBeLessThan(2000)

            const successfulWrites = results.filter(r => !r.error)
            expect(successfulWrites.length).toBeGreaterThan(0)
        })
    })

    describe('Memory and Resource Usage', () => {
        it('should not leak memory during repeated availability calculations', async () => {
            const initialMemory = process.memoryUsage().heapUsed

            // Perform many availability calculations
            for (let i = 0; i < 100; i++) {
                const date = `2024-01-${(20 + (i % 10)).toString().padStart(2, '0')}`
                const existingAppointments = Array.from({ length: i % 10 }, (_, j) => ({
                    appointment_time: `${(9 + j).toString().padStart(2, '0')}:00`
                }))

                await calculateAvailability(date, existingAppointments)
            }

            // Force garbage collection if available
            if (global.gc) {
                global.gc()
            }

            const finalMemory = process.memoryUsage().heapUsed
            const memoryIncrease = finalMemory - initialMemory

            // Memory increase should be reasonable (less than 10MB)
            expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
        })

        it('should handle large datasets efficiently', async () => {
            // Create a large dataset of appointments
            const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
                appointment_time: `${(8 + Math.floor(i / 20)).toString().padStart(2, '0')}:${((i % 2) * 30).toString().padStart(2, '0')}`
            }))

            const startTime = performance.now()
            const result = await calculateAvailability('2024-01-20', largeDataset)
            const endTime = performance.now()

            // Should handle large dataset within reasonable time
            expect(endTime - startTime).toBeLessThan(500)
            expect(result.availableSlots).toBeDefined()
        })
    })

    describe('Edge Cases Performance', () => {
        it('should handle edge case: booking at exact same millisecond', async () => {
            const simultaneousRequests = Array.from({ length: 5 }, () => ({
                appointment_date: '2024-01-20',
                appointment_time: '09:00'
            }))

            // Execute all requests at exactly the same time
            const promises = simultaneousRequests.map(request =>
                mockDatabase.createAppointment({
                    ...request,
                    patient_name: 'Test Patient',
                    patient_email: 'test@example.com'
                })
            )

            const results = await Promise.allSettled(promises)

            const successful = results.filter(r => r.status === 'fulfilled')
            const failed = results.filter(r => r.status === 'rejected')

            // Only one should succeed, others should fail due to conflicts
            expect(successful.length).toBe(1)
            expect(failed.length).toBe(4)
        })

        it('should handle rapid sequential bookings', async () => {
            const sequentialRequests = Array.from({ length: 10 }, (_, i) => ({
                appointment_date: '2024-01-20',
                appointment_time: `${(9 + i).toString().padStart(2, '0')}:00`
            }))

            const startTime = performance.now()

            // Execute requests sequentially as fast as possible
            const results = []
            for (const request of sequentialRequests) {
                try {
                    const appointment = await mockDatabase.createAppointment({
                        ...request,
                        patient_name: 'Sequential Patient',
                        patient_email: 'sequential@example.com'
                    })
                    results.push({ success: true, appointment })
                } catch (error) {
                    results.push({ success: false, error: error.message })
                }
            }

            const endTime = performance.now()

            // Should complete quickly
            expect(endTime - startTime).toBeLessThan(1000)

            // All should succeed (different times)
            const successCount = results.filter(r => r.success).length
            expect(successCount).toBe(10)
        })
    })
})
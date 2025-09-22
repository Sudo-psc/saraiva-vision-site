/**
 * Appointment Booking Component
 * Patient-facing appointment scheduling interface
 * Requirements: 4.1, 4.4, 4.5 - Real-time availability, conflict prevention, error handling
 */

import React, { useState, useEffect } from 'react'
import { formatDateBR, formatTimeBR, getDayNameBR } from '../lib/appointmentAvailability.js'
import { useAnalytics, useVisibilityTracking } from '../hooks/useAnalytics'

const AppointmentBooking = () => {
    // Analytics integration
    const { trackFormView, trackFormSubmit, trackAppointment, trackInteraction } = useAnalytics();
    const appointmentFormRef = useVisibilityTracking('appointment_form_view');

    const [step, setStep] = useState(1) // 1: Select Date/Time, 2: Patient Info, 3: Confirmation
    const [availability, setAvailability] = useState({})
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedTime, setSelectedTime] = useState('')
    const [patientData, setPatientData] = useState({
        patient_name: '',
        patient_email: '',
        patient_phone: '',
        notes: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [appointmentResult, setAppointmentResult] = useState(null)

    // Load availability on component mount
    useEffect(() => {
        loadAvailability()
        trackFormView('appointment')
    }, [trackFormView])

    const loadAvailability = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/appointments/availability?days=14')
            const result = await response.json()

            if (result.success) {
                setAvailability(result.data.availability)
            } else {
                setError('Erro ao carregar disponibilidade. Tente novamente.')
            }
        } catch (error) {
            console.error('Error loading availability:', error)
            setError('Erro ao carregar disponibilidade. Verifique sua conexão.')
        } finally {
            setLoading(false)
        }
    }

    const handleDateTimeSelection = (date, time) => {
        setSelectedDate(date)
        setSelectedTime(time)
        setStep(2)
        setError('')
    }

    const handlePatientDataChange = (field, value) => {
        setPatientData(prev => ({
            ...prev,
            [field]: value
        }))
        setError('')
    }

    const validatePatientData = () => {
        const errors = []

        if (!patientData.patient_name.trim() || patientData.patient_name.trim().length < 2) {
            errors.push('Nome deve ter pelo menos 2 caracteres')
        }

        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
        if (!emailRegex.test(patientData.patient_email)) {
            errors.push('Email deve ter um formato válido')
        }

        const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/
        if (!phoneRegex.test(patientData.patient_phone.replace(/\s/g, ''))) {
            errors.push('Telefone deve ter um formato válido (ex: (11) 99999-9999)')
        }

        return errors
    }

    const handleSubmitAppointment = async () => {
        const validationErrors = validatePatientData()
        if (validationErrors.length > 0) {
            setError(validationErrors.join(', '))
            return
        }

        try {
            setLoading(true)
            setError('')

            const appointmentData = {
                ...patientData,
                appointment_date: selectedDate,
                appointment_time: selectedTime
            }

            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(appointmentData)
            })

            const result = await response.json()

            if (result.success) {
                setAppointmentResult(result.data)
                setSuccess(true)
                setStep(3)

                // Track successful appointment submission
                trackFormSubmit('appointment', {
                    patient_name: patientData.patient_name,
                    patient_email: patientData.patient_email,
                    patient_phone: patientData.patient_phone,
                    appointment_date: selectedDate,
                    appointment_time: selectedTime,
                    notes: patientData.notes
                });

                // Track appointment metrics
                trackAppointment('completed', {
                    appointment_id: result.data.id,
                    date: selectedDate,
                    time: selectedTime
                });
            } else {
                if (result.error.code === 'SLOT_UNAVAILABLE') {
                    setError('Este horário não está mais disponível. Por favor, escolha outro horário.')
                    setStep(1)
                    await loadAvailability() // Refresh availability
                } else {
                    setError(result.error.message || 'Erro ao agendar consulta. Tente novamente.')
                }
            }
        } catch (error) {
            console.error('Error booking appointment:', error)
            setError('Erro ao agendar consulta. Verifique sua conexão e tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const resetBooking = () => {
        setStep(1)
        setSelectedDate('')
        setSelectedTime('')
        setPatientData({
            patient_name: '',
            patient_email: '',
            patient_phone: '',
            notes: ''
        })
        setError('')
        setSuccess(false)
        setAppointmentResult(null)
        loadAvailability()
    }

    if (loading && step === 1) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando horários disponíveis...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 text-white p-6">
                    <h2 className="text-2xl font-bold">Agendar Consulta</h2>
                    <p className="mt-2 opacity-90">Dr. Philipe Saraiva - Oftalmologista</p>
                </div>

                {/* Progress Steps */}
                <div className="bg-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                                1
                            </div>
                            <span className="ml-2 font-medium">Escolher Horário</span>
                        </div>
                        <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                                2
                            </div>
                            <span className="ml-2 font-medium">Dados Pessoais</span>
                        </div>
                        <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                                3
                            </div>
                            <span className="ml-2 font-medium">Confirmação</span>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 m-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 1: Date and Time Selection */}
                {step === 1 && (
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Escolha a data e horário</h3>

                        {Object.keys(availability).length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-600">Não há horários disponíveis no momento.</p>
                                <button
                                    onClick={loadAvailability}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Tentar Novamente
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {Object.entries(availability).map(([date, slots]) => (
                                    <div key={date} className="border rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-800 mb-3">
                                            {getDayNameBR(date)}, {formatDateBR(date)}
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                            {slots.map((slot) => (
                                                <button
                                                    key={`${date}-${slot.slot_time}`}
                                                    onClick={() => handleDateTimeSelection(date, slot.slot_time)}
                                                    className="px-3 py-2 border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm"
                                                    disabled={!slot.is_available}
                                                >
                                                    {formatTimeBR(slot.slot_time)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Patient Information */}
                {step === 2 && (
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Dados pessoais</h3>

                        {/* Selected appointment summary */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-blue-800">Horário selecionado:</h4>
                            <p className="text-blue-700">
                                {getDayNameBR(selectedDate)}, {formatDateBR(selectedDate)} às {formatTimeBR(selectedTime)}
                            </p>
                        </div>

                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome completo *
                                </label>
                                <input
                                    type="text"
                                    value={patientData.patient_name}
                                    onChange={(e) => handlePatientDataChange('patient_name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Seu nome completo"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={patientData.patient_email}
                                    onChange={(e) => handlePatientDataChange('patient_email', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Telefone *
                                </label>
                                <input
                                    type="tel"
                                    value={patientData.patient_phone}
                                    onChange={(e) => handlePatientDataChange('patient_phone', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="(11) 99999-9999"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Observações (opcional)
                                </label>
                                <textarea
                                    value={patientData.notes}
                                    onChange={(e) => handlePatientDataChange('notes', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Informações adicionais sobre sua consulta..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-between mt-6">
                            <button
                                onClick={() => setStep(1)}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleSubmitAppointment}
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Agendando...' : 'Agendar Consulta'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && success && appointmentResult && (
                    <div className="p-6">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Consulta agendada com sucesso!
                            </h3>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold text-green-800 mb-2">Detalhes da consulta:</h4>
                                <p className="text-green-700">
                                    <strong>Paciente:</strong> {appointmentResult.appointment.patient_name}
                                </p>
                                <p className="text-green-700">
                                    <strong>Data:</strong> {getDayNameBR(appointmentResult.appointment.appointment_date)}, {formatDateBR(appointmentResult.appointment.appointment_date)}
                                </p>
                                <p className="text-green-700">
                                    <strong>Horário:</strong> {formatTimeBR(appointmentResult.appointment.appointment_time)}
                                </p>
                                <p className="text-green-700">
                                    <strong>Status:</strong> Pendente de confirmação
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold text-blue-800 mb-2">Próximos passos:</h4>
                                <ul className="text-blue-700 text-sm space-y-1">
                                    <li>✓ Confirmação enviada por email e SMS</li>
                                    <li>✓ Lembretes serão enviados 24h e 2h antes da consulta</li>
                                    <li>✓ Chegue com 15 minutos de antecedência</li>
                                    <li>✓ Traga documento com foto e óculos/lentes atuais</li>
                                </ul>
                            </div>

                            <button
                                onClick={resetBooking}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Agendar Nova Consulta
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AppointmentBooking
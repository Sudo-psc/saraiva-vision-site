'use client'

import { useState, useEffect } from 'react'
import { usePostHog } from 'posthog-js/react'
import ServiceSelector from '../components/agendamento/ServiceSelector'
import Calendar from '../components/agendamento/Calendar'
import TimeSlotPicker from '../components/agendamento/TimeSlotPicker'
import BookingForm from '../components/agendamento/BookingForm'

export default function AgendamentoPage() {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const posthog = usePostHog()

  useEffect(() => {
    posthog.capture('view_schedule_page')
  }, [posthog])

  const handleSelectService = (serviceId: string) => {
    setSelectedService(serviceId)
    setStep(2)
  }

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date)
    setStep(3)
  }

  const handleSelectTimeSlot = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot)
    setStep(4)
  }

  const handleBookingSubmit = async (formData: { name: string; email: string }) => {
    if (!selectedService || !selectedDate || !selectedTimeSlot) return

    const [hours, minutes] = selectedTimeSlot.split(':').map(Number)
    const startTime = new Date(selectedDate)
    startTime.setHours(hours, minutes)

    const bookingData = {
      serviceId: selectedService,
      userName: formData.name,
      userEmail: formData.email,
      startTime: startTime.toISOString(),
    }

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      if (response.ok) {
        const data = await response.json()
        posthog.capture('book_appointment', { 
          serviceId: selectedService,
          appointmentId: data.appointment.id
        })
        setStep(5) // Confirmation step
      } else {
        console.error('Failed to create appointment')
      }
    } catch (error) {
      console.error('Failed to create appointment:', error)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Book an Appointment</h1>

      {step === 1 && <ServiceSelector onSelectService={handleSelectService} />}
      {step === 2 && selectedService && <Calendar onSelectDate={handleSelectDate} />}
      {step === 3 && selectedService && selectedDate && <TimeSlotPicker serviceId={selectedService} date={selectedDate} onSelectTimeSlot={handleSelectTimeSlot} />}
      {step === 4 && <BookingForm onSubmit={handleBookingSubmit} />}
      {step === 5 && (
        <div>
          <h2 className="text-2xl font-bold text-green-500">Booking Confirmed!</h2>
          <p>Your appointment has been successfully booked. You will receive a confirmation email shortly.</p>
        </div>
      )}
    </div>
  )
}

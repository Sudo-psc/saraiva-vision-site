'use client'

import { useEffect, useState } from 'react'
import { usePostHog } from 'posthog-js/react'

interface TimeSlotPickerProps {
  serviceId: string
  date: Date
  onSelectTimeSlot: (timeSlot: string) => void
}

export default function TimeSlotPicker({ serviceId, date, onSelectTimeSlot }: TimeSlotPickerProps) {
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const posthog = usePostHog()

  useEffect(() => {
    async function fetchAvailability() {
      if (!serviceId || !date) return

      setLoading(true)
      try {
        const dateString = date.toISOString().split('T')[0]
        const response = await fetch(`/api/availability?serviceId=${serviceId}&date=${dateString}`)
        const data = await response.json()
        setTimeSlots(data.availability.map((slot: any) => new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })))
      } catch (error) {
        console.error('Failed to fetch availability:', error)
      }
      setLoading(false)
    }

    fetchAvailability()
  }, [serviceId, date])

  const handleTimeSlotSelect = (slot: string) => {
    posthog.capture('select_timeslot', { 
      serviceId: serviceId,
      date: date.toISOString().split('T')[0],
      timeSlot: slot 
    })
    onSelectTimeSlot(slot)
  }

  if (loading) {
    return <div>Loading time slots...</div>
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Select a Time Slot</h2>
      <div className="grid grid-cols-3 gap-4">
        {timeSlots.map((slot) => (
          <button
            key={slot}
            className="p-2 border rounded-lg cursor-pointer hover:bg-gray-100"
            onClick={() => handleTimeSlotSelect(slot)}
          >
            {slot}
          </button>
        ))}
      </div>
    </div>
  )
}

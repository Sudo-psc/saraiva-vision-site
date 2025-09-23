import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const serviceId = searchParams.get('serviceId')

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const targetDate = new Date(date)
    const dayOfWeek = targetDate.getDay() // 0 = Sunday, 1 = Monday, etc.

    // Get service duration for calculating time slots
    let serviceDuration = 30 // default 30 minutes
    if (serviceId) {
      const { data: service } = await supabase
        .from('services')
        .select('duration')
        .eq('id', serviceId)
        .single()

      if (service) {
        serviceDuration = service.duration
      }
    }

    // Get availability rules for the day of week
    const { data: rules, error: rulesError } = await supabase
      .from('availability_rules')
      .select('*')
      .eq('day_of_week', dayOfWeek)

    if (rulesError) {
      console.error('Error fetching availability rules:', rulesError)
      return NextResponse.json(
        { error: 'Failed to fetch availability rules' },
        { status: 500 }
      )
    }

    // Get availability overrides for the specific date
    const { data: overrides, error: overridesError } = await supabase
      .from('availability_overrides')
      .select('*')
      .eq('date', date)

    if (overridesError) {
      console.error('Error fetching availability overrides:', overridesError)
      return NextResponse.json(
        { error: 'Failed to fetch availability overrides' },
        { status: 500 }
      )
    }

    // Get existing appointments for the date
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('start_time, end_time')
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString())
      .in('status', ['confirmed'])

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError)
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      )
    }

    // Calculate available time slots
    const availableSlots = calculateAvailableSlots(
      rules,
      overrides,
      appointments || [],
      serviceDuration,
      date
    )

    return NextResponse.json({
      availability: availableSlots,
      date,
      serviceDuration
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateAvailableSlots(rules, overrides, appointments, serviceDuration, date) {
  const slots = []
  const targetDate = new Date(date)

  // Check if there's an override for this date
  const override = overrides.find(o => new Date(o.date).toDateString() === targetDate.toDateString())

  if (override && !override.is_available) {
    // Day is completely unavailable
    return []
  }

  // Use override times if available, otherwise use regular rules
  let workingHours = []
  if (override && override.start_time && override.end_time) {
    workingHours = [{
      start_time: override.start_time,
      end_time: override.end_time
    }]
  } else {
    workingHours = rules
  }

  // Generate time slots for each working period
  for (const period of workingHours) {
    const startTime = new Date(`${date}T${period.start_time}`)
    const endTime = new Date(`${date}T${period.end_time}`)

    let currentSlot = new Date(startTime)

    while (currentSlot.getTime() + serviceDuration * 60000 <= endTime.getTime()) {
      const slotEndTime = new Date(currentSlot.getTime() + serviceDuration * 60000)

      // Check if this slot conflicts with existing appointments
      const isAvailable = !appointments.some(appointment => {
        const appointmentStart = new Date(appointment.start_time)
        const appointmentEnd = new Date(appointment.end_time)

        return (
          (currentSlot >= appointmentStart && currentSlot < appointmentEnd) ||
          (slotEndTime > appointmentStart && slotEndTime <= appointmentEnd) ||
          (currentSlot <= appointmentStart && slotEndTime >= appointmentEnd)
        )
      })

      if (isAvailable) {
        slots.push({
          start: currentSlot.toISOString(),
          end: slotEndTime.toISOString()
        })
      }

      currentSlot = new Date(currentSlot.getTime() + serviceDuration * 60000)
    }
  }

  return slots
}

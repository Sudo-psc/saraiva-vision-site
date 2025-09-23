import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

// Schema for appointment validation
const createAppointmentSchema = z.object({
  serviceId: z.string().uuid(),
  userName: z.string().min(1, 'Name is required'),
  userEmail: z.string().email('Valid email is required'),
  startTime: z.string().datetime(),
  notes: z.string().optional()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = createAppointmentSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validatedData.error.issues },
        { status: 400 }
      )
    }

    const { serviceId, userName, userEmail, startTime, notes } = validatedData.data

    const supabase = createClient()

    // Get service details
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration, price')
      .eq('id', serviceId)
      .single()

    if (serviceError || !service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Calculate end time based on service duration
    const startDateTime = new Date(startTime)
    const endDateTime = new Date(startDateTime.getTime() + service.duration * 60000)

    // Check for conflicting appointments
    const { data: conflictingAppointments, error: conflictError } = await supabase
      .from('appointments')
      .select('id')
      .gte('start_time', startDateTime.toISOString())
      .lt('start_time', endDateTime.toISOString())
      .in('status', ['confirmed'])

    if (conflictError) {
      console.error('Error checking for conflicts:', conflictError)
      return NextResponse.json(
        { error: 'Failed to check availability' },
        { status: 500 }
      )
    }

    if (conflictingAppointments && conflictingAppointments.length > 0) {
      return NextResponse.json(
        { error: 'Time slot is no longer available' },
        { status: 409 }
      )
    }

    // Create the appointment
    const { data: appointment, error: createError } = await supabase
      .from('appointments')
      .insert({
        service_id: serviceId,
        user_name: userName,
        user_email: userEmail,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: 'confirmed'
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating appointment:', createError)
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      appointment: {
        id: appointment.id,
        serviceId: appointment.service_id,
        userName: appointment.user_name,
        userEmail: appointment.user_email,
        startTime: appointment.start_time,
        endTime: appointment.end_time,
        status: appointment.status,
        createdAt: appointment.created_at
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@/utils/supabase/server'
import { createClient as createPostHogClient } from '@/utils/posthog/server'
import { z } from 'zod'

// Schema for appointment update validation
const updateAppointmentSchema = z.object({
  status: z.enum(['confirmed', 'cancelled']).optional(),
  userName: z.string().min(1, 'Name is required').optional(),
  userEmail: z.string().email('Valid email is required').optional(),
  startTime: z.string().datetime().optional()
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const supabase = createSupabaseClient()

    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        service:services (
          id,
          name,
          description,
          duration,
          price
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching appointment:', error)
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      appointment: {
        id: appointment.id,
        serviceId: appointment.service_id,
        service: appointment.service,
        userName: appointment.user_name,
        userEmail: appointment.user_email,
        startTime: appointment.start_time,
        endTime: appointment.end_time,
        status: appointment.status,
        createdAt: appointment.created_at
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    // Validate input
    const validatedData = updateAppointmentSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validatedData.error.issues },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient()

    // Check if appointment exists
    const { data: existingAppointment, error: fetchError } = await supabase
      .from('appointments')
      .select('service_id, start_time, end_time, user_email')
      .eq('id', id)
      .single()

    if (fetchError || !existingAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    if (validatedData.data.status !== undefined) {
      updateData.status = validatedData.data.status
    }
    if (validatedData.data.userName !== undefined) {
      updateData.user_name = validatedData.data.userName
    }
    if (validatedData.data.userEmail !== undefined) {
      updateData.user_email = validatedData.data.userEmail
    }
    if (validatedData.data.startTime !== undefined) {
      // If changing start time, we need to recalculate end time
      const { data: service } = await supabase
        .from('services')
        .select('duration')
        .eq('id', existingAppointment.service_id)
        .single()

      if (service) {
        const newStartTime = new Date(validatedData.data.startTime)
        const newEndTime = new Date(newStartTime.getTime() + service.duration * 60000)
        updateData.start_time = newStartTime.toISOString()
        updateData.end_time = newEndTime.toISOString()
      }
    }

    // Update the appointment
    const { data: appointment, error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating appointment:', updateError)
      return NextResponse.json(
        { error: 'Failed to update appointment' },
        { status: 500 }
      )
    }

    // Track cancellation event
    if (updateData.status === 'cancelled') {
      const posthog = createPostHogClient()
      posthog.capture({
        distinctId: existingAppointment.user_email,
        event: 'cancel_appointment',
        properties: {
          appointmentId: id,
          serviceId: existingAppointment.service_id,
        },
      })
      await posthog.shutdown()
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
        updatedAt: appointment.updated_at
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

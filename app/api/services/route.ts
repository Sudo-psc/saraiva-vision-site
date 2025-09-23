import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()

    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching services:', error)
      return NextResponse.json(
        { error: 'Failed to fetch services' },
        { status: 500 }
      )
    }

    return NextResponse.json({ services })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

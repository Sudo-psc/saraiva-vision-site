import { createClient } from '@supabase/supabase-js'

// Database type definitions
export interface Database {
    public: {
        Tables: {
            contact_messages: {
                Row: {
                    id: string
                    name: string
                    email: string
                    phone: string
                    message: string
                    consent_given: boolean
                    ip_hash: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    email: string
                    phone: string
                    message: string
                    consent_given: boolean
                    ip_hash?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string
                    phone?: string
                    message?: string
                    consent_given?: boolean
                    ip_hash?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            appointments: {
                Row: {
                    id: string
                    patient_name: string
                    patient_email: string
                    patient_phone: string
                    appointment_date: string
                    appointment_time: string
                    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
                    confirmation_token: string | null
                    notes: string | null
                    created_at: string
                    confirmed_at: string | null
                    reminder_24h_sent: boolean
                    reminder_2h_sent: boolean
                }
                Insert: {
                    id?: string
                    patient_name: string
                    patient_email: string
                    patient_phone: string
                    appointment_date: string
                    appointment_time: string
                    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
                    confirmation_token?: string | null
                    notes?: string | null
                    created_at?: string
                    confirmed_at?: string | null
                    reminder_24h_sent?: boolean
                    reminder_2h_sent?: boolean
                }
                Update: {
                    id?: string
                    patient_name?: string
                    patient_email?: string
                    patient_phone?: string
                    appointment_date?: string
                    appointment_time?: string
                    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
                    confirmation_token?: string | null
                    notes?: string | null
                    created_at?: string
                    confirmed_at?: string | null
                    reminder_24h_sent?: boolean
                    reminder_2h_sent?: boolean
                }
            }
            message_outbox: {
                Row: {
                    id: string
                    message_type: 'email' | 'sms'
                    recipient: string
                    subject: string | null
                    content: string
                    template_data: any | null
                    status: 'pending' | 'sent' | 'failed' | 'cancelled'
                    retry_count: number
                    max_retries: number
                    send_after: string
                    sent_at: string | null
                    error_message: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    message_type: 'email' | 'sms'
                    recipient: string
                    subject?: string | null
                    content: string
                    template_data?: any | null
                    status?: 'pending' | 'sent' | 'failed' | 'cancelled'
                    retry_count?: number
                    max_retries?: number
                    send_after?: string
                    sent_at?: string | null
                    error_message?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    message_type?: 'email' | 'sms'
                    recipient?: string
                    subject?: string | null
                    content?: string
                    template_data?: any | null
                    status?: 'pending' | 'sent' | 'failed' | 'cancelled'
                    retry_count?: number
                    max_retries?: number
                    send_after?: string
                    sent_at?: string | null
                    error_message?: string | null
                    created_at?: string
                }
            }
            podcast_episodes: {
                Row: {
                    id: string
                    spotify_id: string | null
                    title: string
                    description: string | null
                    duration_ms: number | null
                    published_at: string | null
                    spotify_url: string | null
                    embed_url: string | null
                    image_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    spotify_id?: string | null
                    title: string
                    description?: string | null
                    duration_ms?: number | null
                    published_at?: string | null
                    spotify_url?: string | null
                    embed_url?: string | null
                    image_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    spotify_id?: string | null
                    title?: string
                    description?: string | null
                    duration_ms?: number | null
                    published_at?: string | null
                    spotify_url?: string | null
                    embed_url?: string | null
                    image_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            event_log: {
                Row: {
                    id: string
                    event_type: string
                    event_data: any | null
                    severity: 'debug' | 'info' | 'warn' | 'error' | 'critical'
                    source: string | null
                    request_id: string | null
                    user_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    event_type: string
                    event_data?: any | null
                    severity?: 'debug' | 'info' | 'warn' | 'error' | 'critical'
                    source?: string | null
                    request_id?: string | null
                    user_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    event_type?: string
                    event_data?: any | null
                    severity?: 'debug' | 'info' | 'warn' | 'error' | 'critical'
                    source?: string | null
                    request_id?: string | null
                    user_id?: string | null
                    created_at?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    role: 'user' | 'admin' | 'super_admin'
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                    last_login: string | null
                    is_active: boolean
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    role?: 'user' | 'admin' | 'super_admin'
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                    last_login?: string | null
                    is_active?: boolean
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    role?: 'user' | 'admin' | 'super_admin'
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                    last_login?: string | null
                    is_active?: boolean
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            check_appointment_availability: {
                Args: {
                    p_date: string
                    p_time: string
                    p_exclude_id?: string
                }
                Returns: boolean
            }
            get_available_slots: {
                Args: {
                    p_start_date: string
                    p_end_date?: string
                }
                Returns: {
                    slot_date: string
                    slot_time: string
                    is_available: boolean
                }[]
            }
            add_to_outbox: {
                Args: {
                    p_message_type: 'email' | 'sms'
                    p_recipient: string
                    p_subject: string
                    p_content: string
                    p_template_data?: any
                    p_send_after?: string
                }
                Returns: string
            }
            log_event: {
                Args: {
                    p_event_type: string
                    p_event_data?: any
                    p_severity?: 'debug' | 'info' | 'warn' | 'error' | 'critical'
                    p_source?: string
                    p_request_id?: string
                    p_user_id?: string
                }
                Returns: string
            }
            get_dashboard_stats: {
                Args: {}
                Returns: any
            }
            is_admin_user: {
                Args: {
                    user_id?: string
                }
                Returns: boolean
            }
            get_user_role_from_profile: {
                Args: {
                    user_id?: string
                }
                Returns: string
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for frontend operations (with RLS)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Admin client for backend operations (bypasses RLS)
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

// Type exports for use in other files
export type ContactMessage = Database['public']['Tables']['contact_messages']['Row']
export type ContactMessageInsert = Database['public']['Tables']['contact_messages']['Insert']
export type ContactMessageUpdate = Database['public']['Tables']['contact_messages']['Update']

export type Appointment = Database['public']['Tables']['appointments']['Row']
export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert']
export type AppointmentUpdate = Database['public']['Tables']['appointments']['Update']

export type MessageOutbox = Database['public']['Tables']['message_outbox']['Row']
export type MessageOutboxInsert = Database['public']['Tables']['message_outbox']['Insert']
export type MessageOutboxUpdate = Database['public']['Tables']['message_outbox']['Update']

export type PodcastEpisode = Database['public']['Tables']['podcast_episodes']['Row']
export type PodcastEpisodeInsert = Database['public']['Tables']['podcast_episodes']['Insert']
export type PodcastEpisodeUpdate = Database['public']['Tables']['podcast_episodes']['Update']

export type EventLog = Database['public']['Tables']['event_log']['Row']
export type EventLogInsert = Database['public']['Tables']['event_log']['Insert']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type AvailableSlot = Database['public']['Functions']['get_available_slots']['Returns'][0]
export type DashboardStats = Database['public']['Functions']['get_dashboard_stats']['Returns']
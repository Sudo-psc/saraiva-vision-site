-- Appointment Waitlist System
-- Supports waitlist management for appointment booking through chatbot
-- Requirements: 2.4, 2.6

-- Create appointment waitlist table
CREATE TABLE IF NOT EXISTS appointment_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255),
    patient_name VARCHAR(255) NOT NULL,
    patient_email VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(20) NOT NULL,
    
    -- Preferred appointment details
    preferred_date DATE,
    preferred_time TIME,
    preferred_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    
    -- Flexibility preferences
    time_flexibility VARCHAR(50) DEFAULT 'flexible', -- 'strict', 'flexible', 'morning_only', 'afternoon_only'
    date_flexibility VARCHAR(50) DEFAULT 'same_week', -- 'same_day', 'same_week', 'same_month', 'flexible'
    
    -- Status and metadata
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'notified', 'confirmed', 'cancelled', 'expired'
    priority INTEGER DEFAULT 0, -- Higher priority gets notified first
    notes TEXT,
    
    -- Notification tracking
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    notification_expires_at TIMESTAMP WITH TIME ZONE,
    response_deadline TIMESTAMP WITH TIME ZONE,
    
    -- Cancellation info
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    created_via VARCHAR(50) DEFAULT 'chatbot',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('active', 'notified', 'confirmed', 'cancelled', 'expired')),
    CONSTRAINT valid_time_flexibility CHECK (time_flexibility IN ('strict', 'flexible', 'morning_only', 'afternoon_only')),
    CONSTRAINT valid_date_flexibility CHECK (date_flexibility IN ('same_day', 'same_week', 'same_month', 'flexible'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointment_waitlist_status ON appointment_waitlist(status);
CREATE INDEX IF NOT EXISTS idx_appointment_waitlist_preferred_date ON appointment_waitlist(preferred_date);
CREATE INDEX IF NOT EXISTS idx_appointment_waitlist_patient_email ON appointment_waitlist(patient_email);
CREATE INDEX IF NOT EXISTS idx_appointment_waitlist_session_id ON appointment_waitlist(session_id);
CREATE INDEX IF NOT EXISTS idx_appointment_waitlist_created_at ON appointment_waitlist(created_at);
CREATE INDEX IF NOT EXISTS idx_appointment_waitlist_priority ON appointment_waitlist(priority DESC, created_at ASC);

-- Create composite index for active waitlist queries
CREATE INDEX IF NOT EXISTS idx_appointment_waitlist_active_priority 
ON appointment_waitlist(status, priority DESC, created_at ASC) 
WHERE status = 'active';

-- Add RLS policies
ALTER TABLE appointment_waitlist ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access)
CREATE POLICY "Service role can manage all waitlist entries" ON appointment_waitlist
    FOR ALL USING (auth.role() = 'service_role');

-- Policy for authenticated users (can only see their own entries)
CREATE POLICY "Users can view their own waitlist entries" ON appointment_waitlist
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        patient_email = auth.jwt() ->> 'email'
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_appointment_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_appointment_waitlist_updated_at
    BEFORE UPDATE ON appointment_waitlist
    FOR EACH ROW
    EXECUTE FUNCTION update_appointment_waitlist_updated_at();

-- Function to get waitlist position
CREATE OR REPLACE FUNCTION get_waitlist_position(waitlist_entry_id UUID)
RETURNS INTEGER AS $$
DECLARE
    entry_created_at TIMESTAMP WITH TIME ZONE;
    position INTEGER;
BEGIN
    -- Get the created_at timestamp for the entry
    SELECT created_at INTO entry_created_at
    FROM appointment_waitlist
    WHERE id = waitlist_entry_id AND status = 'active';
    
    IF entry_created_at IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Count entries created before this one
    SELECT COUNT(*) + 1 INTO position
    FROM appointment_waitlist
    WHERE status = 'active' 
    AND (
        priority > (SELECT priority FROM appointment_waitlist WHERE id = waitlist_entry_id)
        OR (
            priority = (SELECT priority FROM appointment_waitlist WHERE id = waitlist_entry_id)
            AND created_at < entry_created_at
        )
    );
    
    RETURN position;
END;
$$ LANGUAGE plpgsql;

-- Function to find matching waitlist entries when a slot becomes available
CREATE OR REPLACE FUNCTION find_matching_waitlist_entries(
    available_date DATE,
    available_time TIME,
    max_results INTEGER DEFAULT 5
)
RETURNS TABLE (
    waitlist_id UUID,
    patient_name VARCHAR(255),
    patient_email VARCHAR(255),
    patient_phone VARCHAR(20),
    priority INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    match_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id as waitlist_id,
        w.patient_name,
        w.patient_email,
        w.patient_phone,
        w.priority,
        w.created_at,
        -- Calculate match score based on preferences
        CASE 
            -- Exact date and time match
            WHEN w.preferred_date = available_date AND w.preferred_time = available_time THEN 100
            -- Exact date match, flexible time
            WHEN w.preferred_date = available_date AND w.time_flexibility = 'flexible' THEN 90
            -- Same week, flexible date and time
            WHEN w.date_flexibility IN ('same_week', 'flexible') 
                 AND w.time_flexibility = 'flexible'
                 AND ABS(EXTRACT(DOW FROM available_date) - EXTRACT(DOW FROM w.preferred_date)) <= 3 THEN 80
            -- Morning preference match
            WHEN w.time_flexibility = 'morning_only' 
                 AND EXTRACT(HOUR FROM available_time) < 12 THEN 70
            -- Afternoon preference match
            WHEN w.time_flexibility = 'afternoon_only' 
                 AND EXTRACT(HOUR FROM available_time) >= 12 THEN 70
            -- Flexible preferences
            WHEN w.time_flexibility = 'flexible' AND w.date_flexibility = 'flexible' THEN 60
            ELSE 0
        END as match_score
    FROM appointment_waitlist w
    WHERE w.status = 'active'
    AND (
        -- Exact matches
        (w.preferred_date = available_date AND w.preferred_time = available_time)
        OR
        -- Flexible matches
        (w.date_flexibility IN ('same_week', 'flexible') AND w.time_flexibility = 'flexible')
        OR
        -- Time preference matches
        (w.time_flexibility = 'morning_only' AND EXTRACT(HOUR FROM available_time) < 12)
        OR
        (w.time_flexibility = 'afternoon_only' AND EXTRACT(HOUR FROM available_time) >= 12)
    )
    ORDER BY 
        match_score DESC,
        w.priority DESC,
        w.created_at ASC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Function to notify waitlist entries about available slots
CREATE OR REPLACE FUNCTION notify_waitlist_entries(
    available_date DATE,
    available_time TIME,
    appointment_id UUID DEFAULT NULL
)
RETURNS TABLE (
    notified_count INTEGER,
    waitlist_ids UUID[]
) AS $$
DECLARE
    matching_entries RECORD;
    notified_ids UUID[] := '{}';
    notification_expires TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Set notification expiration (2 hours from now)
    notification_expires := NOW() + INTERVAL '2 hours';
    
    -- Find and notify matching waitlist entries
    FOR matching_entries IN 
        SELECT * FROM find_matching_waitlist_entries(available_date, available_time, 3)
    LOOP
        -- Update waitlist entry status
        UPDATE appointment_waitlist
        SET 
            status = 'notified',
            notification_sent_at = NOW(),
            notification_expires_at = notification_expires,
            response_deadline = notification_expires,
            preferred_appointment_id = appointment_id,
            updated_at = NOW()
        WHERE id = matching_entries.waitlist_id;
        
        -- Add to notified list
        notified_ids := array_append(notified_ids, matching_entries.waitlist_id);
    END LOOP;
    
    RETURN QUERY SELECT array_length(notified_ids, 1), notified_ids;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired waitlist notifications
CREATE OR REPLACE FUNCTION cleanup_expired_waitlist_notifications()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Update expired notifications back to active status
    UPDATE appointment_waitlist
    SET 
        status = 'active',
        notification_sent_at = NULL,
        notification_expires_at = NULL,
        response_deadline = NULL,
        preferred_appointment_id = NULL,
        updated_at = NOW()
    WHERE status = 'notified' 
    AND notification_expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired notifications (if pg_cron is available)
-- This would typically be set up separately in production
-- SELECT cron.schedule('cleanup-waitlist-notifications', '*/15 * * * *', 'SELECT cleanup_expired_waitlist_notifications();');

-- Add comments for documentation
COMMENT ON TABLE appointment_waitlist IS 'Manages appointment waitlist for patients when preferred slots are unavailable';
COMMENT ON COLUMN appointment_waitlist.time_flexibility IS 'Patient flexibility for appointment times: strict, flexible, morning_only, afternoon_only';
COMMENT ON COLUMN appointment_waitlist.date_flexibility IS 'Patient flexibility for appointment dates: same_day, same_week, same_month, flexible';
COMMENT ON COLUMN appointment_waitlist.priority IS 'Higher priority entries get notified first (0 = normal, higher = priority)';
COMMENT ON COLUMN appointment_waitlist.notification_expires_at IS 'When the notification expires and slot becomes available to others';
COMMENT ON FUNCTION get_waitlist_position(UUID) IS 'Returns the position of a waitlist entry (1-based)';
COMMENT ON FUNCTION find_matching_waitlist_entries(DATE, TIME, INTEGER) IS 'Finds waitlist entries that match available appointment slots';
COMMENT ON FUNCTION notify_waitlist_entries(DATE, TIME, UUID) IS 'Notifies matching waitlist entries about available slots';
COMMENT ON FUNCTION cleanup_expired_waitlist_notifications() IS 'Cleans up expired waitlist notifications and returns entries to active status';
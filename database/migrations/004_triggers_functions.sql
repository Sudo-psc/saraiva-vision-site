-- Database triggers and functions for Saraiva Vision backend
-- This migration creates automated triggers for data integrity and audit trails

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate confirmation tokens
CREATE OR REPLACE FUNCTION generate_confirmation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to hash IP addresses for privacy compliance
CREATE OR REPLACE FUNCTION hash_ip_address(ip_address TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(ip_address || current_setting('app.ip_salt', true), 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AUDIT AND LOGGING FUNCTIONS
-- ============================================================================

-- Function to log events automatically
CREATE OR REPLACE FUNCTION log_event(
  p_event_type TEXT,
  p_event_data JSONB DEFAULT NULL,
  p_severity TEXT DEFAULT 'info',
  p_source TEXT DEFAULT NULL,
  p_request_id TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO event_log (
    event_type,
    event_data,
    severity,
    source,
    request_id,
    user_id
  ) VALUES (
    p_event_type,
    p_event_data,
    p_severity,
    p_source,
    p_request_id,
    p_user_id
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- APPOINTMENT MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to check appointment availability
CREATE OR REPLACE FUNCTION check_appointment_availability(
  p_date DATE,
  p_time TIME,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Check if the slot is already booked
  SELECT COUNT(*)
  INTO conflict_count
  FROM appointments
  WHERE appointment_date = p_date
    AND appointment_time = p_time
    AND status IN ('pending', 'confirmed')
    AND (p_exclude_id IS NULL OR id != p_exclude_id);
  
  -- Check if it's within business hours (Monday-Friday, 08:00-18:00)
  IF EXTRACT(DOW FROM p_date) IN (0, 6) THEN -- Sunday = 0, Saturday = 6
    RETURN FALSE;
  END IF;
  
  IF p_time < '08:00:00' OR p_time >= '18:00:00' THEN
    RETURN FALSE;
  END IF;
  
  -- Check if it's in the future (at least 2 hours from now)
  IF p_date = CURRENT_DATE AND p_time <= (CURRENT_TIME + INTERVAL '2 hours') THEN
    RETURN FALSE;
  END IF;
  
  IF p_date < CURRENT_DATE THEN
    RETURN FALSE;
  END IF;
  
  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to get available appointment slots
CREATE OR REPLACE FUNCTION get_available_slots(
  p_start_date DATE,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE(
  slot_date DATE,
  slot_time TIME,
  is_available BOOLEAN
) AS $$
DECLARE
  current_date_iter DATE;
  current_time_iter TIME;
  end_date_calc DATE;
BEGIN
  -- Default to 30 days if end_date not provided
  end_date_calc := COALESCE(p_end_date, p_start_date + INTERVAL '30 days');
  
  -- Generate time slots for each business day
  current_date_iter := p_start_date;
  
  WHILE current_date_iter <= end_date_calc LOOP
    -- Skip weekends
    IF EXTRACT(DOW FROM current_date_iter) NOT IN (0, 6) THEN
      current_time_iter := '08:00:00';
      
      WHILE current_time_iter < '18:00:00' LOOP
        slot_date := current_date_iter;
        slot_time := current_time_iter;
        is_available := check_appointment_availability(current_date_iter, current_time_iter);
        
        RETURN NEXT;
        
        -- Increment by 30 minutes
        current_time_iter := current_time_iter + INTERVAL '30 minutes';
      END LOOP;
    END IF;
    
    current_date_iter := current_date_iter + INTERVAL '1 day';
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MESSAGE OUTBOX FUNCTIONS
-- ============================================================================

-- Function to add message to outbox
CREATE OR REPLACE FUNCTION add_to_outbox(
  p_message_type TEXT,
  p_recipient TEXT,
  p_subject TEXT,
  p_content TEXT,
  p_template_data JSONB DEFAULT NULL,
  p_send_after TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID AS $$
DECLARE
  message_id UUID;
BEGIN
  INSERT INTO message_outbox (
    message_type,
    recipient,
    subject,
    content,
    template_data,
    send_after
  ) VALUES (
    p_message_type,
    p_recipient,
    p_subject,
    p_content,
    p_template_data,
    p_send_after
  ) RETURNING id INTO message_id;
  
  -- Log the event
  PERFORM log_event(
    'message_queued',
    jsonb_build_object(
      'message_id', message_id,
      'message_type', p_message_type,
      'recipient', p_recipient
    ),
    'info',
    'outbox_system'
  );
  
  RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at on contact_messages
CREATE TRIGGER tr_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on podcast_episodes
CREATE TRIGGER tr_podcast_episodes_updated_at
  BEFORE UPDATE ON podcast_episodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to generate confirmation token for appointments
CREATE OR REPLACE FUNCTION generate_appointment_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confirmation_token IS NULL THEN
    NEW.confirmation_token := generate_confirmation_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_appointments_generate_token
  BEFORE INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION generate_appointment_token();

-- Trigger to log appointment changes
CREATE OR REPLACE FUNCTION log_appointment_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_event(
      'appointment_created',
      jsonb_build_object(
        'appointment_id', NEW.id,
        'patient_email', NEW.patient_email,
        'appointment_date', NEW.appointment_date,
        'appointment_time', NEW.appointment_time
      ),
      'info',
      'appointments_api'
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log status changes
    IF OLD.status != NEW.status THEN
      PERFORM log_event(
        'appointment_status_changed',
        jsonb_build_object(
          'appointment_id', NEW.id,
          'old_status', OLD.status,
          'new_status', NEW.status,
          'patient_email', NEW.patient_email
        ),
        'info',
        'appointments_api'
      );
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_appointments_log_changes
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION log_appointment_changes();

-- Trigger to validate appointment availability
CREATE OR REPLACE FUNCTION validate_appointment_slot()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT check_appointment_availability(
    NEW.appointment_date, 
    NEW.appointment_time, 
    NEW.id
  ) THEN
    RAISE EXCEPTION 'Appointment slot is not available: % %', 
      NEW.appointment_date, NEW.appointment_time;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_appointments_validate_slot
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION validate_appointment_slot();
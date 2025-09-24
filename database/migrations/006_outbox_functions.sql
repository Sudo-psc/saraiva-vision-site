-- Outbox Functions for Message Processing
-- This migration creates functions for reliable message delivery

-- Function to add messages to outbox
CREATE OR REPLACE FUNCTION add_to_outbox(
    p_message_type VARCHAR(20),
    p_recipient VARCHAR(255),
    p_subject VARCHAR(255) DEFAULT NULL,
    p_content TEXT,
    p_template_data JSONB DEFAULT NULL,
    p_send_after TIMESTAMPTZ DEFAULT NOW()
) RETURNS UUID AS $$
DECLARE
    message_id UUID;
BEGIN
    INSERT INTO message_outbox (
        message_type,
        recipient,
        subject,
        content,
        template_data,
        send_after,
        status
    ) VALUES (
        p_message_type,
        p_recipient,
        p_subject,
        p_content,
        p_template_data,
        p_send_after,
        'pending'
    ) RETURNING id INTO message_id;
    
    RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending messages for processing
CREATE OR REPLACE FUNCTION get_pending_messages(
    p_batch_size INTEGER DEFAULT 10
) RETURNS TABLE (
    id UUID,
    message_type VARCHAR(20),
    recipient VARCHAR(255),
    subject VARCHAR(255),
    content TEXT,
    template_data JSONB,
    retry_count INTEGER,
    max_retries INTEGER,
    send_after TIMESTAMPTZ,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.message_type,
        m.recipient,
        m.subject,
        m.content,
        m.template_data,
        m.retry_count,
        m.max_retries,
        m.send_after,
        m.created_at
    FROM message_outbox m
    WHERE m.status = 'pending'
      AND m.send_after <= NOW()
      AND m.retry_count < m.max_retries
    ORDER BY m.created_at ASC
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark message as sent
CREATE OR REPLACE FUNCTION mark_message_sent(
    p_message_id UUID,
    p_sent_at TIMESTAMPTZ DEFAULT NOW()
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE message_outbox
    SET status = 'sent',
        sent_at = p_sent_at,
        error_message = NULL
    WHERE id = p_message_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark message as failed and increment retry count
CREATE OR REPLACE FUNCTION mark_message_failed(
    p_message_id UUID,
    p_error_message TEXT,
    p_next_retry TIMESTAMPTZ DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    current_retry_count INTEGER;
    max_retry_count INTEGER;
    should_fail BOOLEAN;
BEGIN
    -- Get current retry counts
    SELECT retry_count, max_retries 
    INTO current_retry_count, max_retry_count
    FROM message_outbox 
    WHERE id = p_message_id;
    
    -- Increment retry count
    current_retry_count := current_retry_count + 1;
    should_fail := current_retry_count >= max_retry_count;
    
    -- Update message status
    UPDATE message_outbox
    SET retry_count = current_retry_count,
        status = CASE WHEN should_fail THEN 'failed' ELSE 'pending' END,
        error_message = p_error_message,
        send_after = CASE WHEN should_fail THEN NULL ELSE COALESCE(p_next_retry, NOW() + INTERVAL '5 minutes') END
    WHERE id = p_message_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get outbox statistics
CREATE OR REPLACE FUNCTION get_outbox_stats(
    p_hours_back INTEGER DEFAULT 24
) RETURNS TABLE (
    total_messages BIGINT,
    pending_messages BIGINT,
    sent_messages BIGINT,
    failed_messages BIGINT,
    email_messages BIGINT,
    sms_messages BIGINT,
    avg_retry_count NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_messages,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_messages,
        COUNT(*) FILTER (WHERE status = 'sent') as sent_messages,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_messages,
        COUNT(*) FILTER (WHERE message_type = 'email') as email_messages,
        COUNT(*) FILTER (WHERE message_type = 'sms') as sms_messages,
        AVG(retry_count) as avg_retry_count
    FROM message_outbox
    WHERE created_at >= NOW() - (p_hours_back || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to retry failed messages that haven't exceeded max retries
CREATE OR REPLACE FUNCTION retry_failed_messages() RETURNS INTEGER AS $$
DECLARE
    retry_count INTEGER;
BEGIN
    UPDATE message_outbox
    SET status = 'pending',
        send_after = NOW(),
        error_message = NULL
    WHERE status = 'failed'
      AND retry_count < max_retries;
    
    GET DIAGNOSTICS retry_count = ROW_COUNT;
    RETURN retry_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to service role
GRANT EXECUTE ON FUNCTION add_to_outbox TO service_role;
GRANT EXECUTE ON FUNCTION get_pending_messages TO service_role;
GRANT EXECUTE ON FUNCTION mark_message_sent TO service_role;
GRANT EXECUTE ON FUNCTION mark_message_failed TO service_role;
GRANT EXECUTE ON FUNCTION get_outbox_stats TO service_role;
GRANT EXECUTE ON FUNCTION retry_failed_messages TO service_role;
-- Validation script for Supabase database setup
-- Run this after completing all migrations to verify everything is working

-- ============================================================================
-- TABLE VALIDATION
-- ============================================================================

DO $$
DECLARE
    table_count INTEGER;
    expected_tables TEXT[] := ARRAY[
        'contact_messages',
        'appointments', 
        'message_outbox',
        'podcast_episodes',
        'event_log',
        'profiles'
    ];
    table_name TEXT;
BEGIN
    RAISE NOTICE '=== TABLE VALIDATION ===';
    
    FOREACH table_name IN ARRAY expected_tables LOOP
        SELECT COUNT(*) INTO table_count
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = table_name;
        
        IF table_count = 1 THEN
            RAISE NOTICE '✓ Table % exists', table_name;
        ELSE
            RAISE EXCEPTION '✗ Table % is missing', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'All required tables exist!';
END $$;

-- ============================================================================
-- RLS VALIDATION
-- ============================================================================

DO $$
DECLARE
    rls_count INTEGER;
    table_name TEXT;
    expected_tables TEXT[] := ARRAY[
        'contact_messages',
        'appointments', 
        'message_outbox',
        'podcast_episodes',
        'event_log',
        'profiles'
    ];
BEGIN
    RAISE NOTICE '=== RLS VALIDATION ===';
    
    FOREACH table_name IN ARRAY expected_tables LOOP
        SELECT COUNT(*) INTO rls_count
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename = table_name 
          AND rowsecurity = true;
        
        IF rls_count = 1 THEN
            RAISE NOTICE '✓ RLS enabled on %', table_name;
        ELSE
            RAISE EXCEPTION '✗ RLS not enabled on %', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'RLS is enabled on all tables!';
END $$;

-- ============================================================================
-- FUNCTION VALIDATION
-- ============================================================================

DO $$
DECLARE
    func_count INTEGER;
    expected_functions TEXT[] := ARRAY[
        'check_appointment_availability',
        'get_available_slots',
        'add_to_outbox',
        'log_event',
        'get_dashboard_stats',
        'is_admin_user',
        'get_user_role_from_profile',
        'update_updated_at_column',
        'generate_confirmation_token',
        'hash_ip_address'
    ];
    func_name TEXT;
BEGIN
    RAISE NOTICE '=== FUNCTION VALIDATION ===';
    
    FOREACH func_name IN ARRAY expected_functions LOOP
        SELECT COUNT(*) INTO func_count
        FROM information_schema.routines 
        WHERE routine_schema = 'public' AND routine_name = func_name;
        
        IF func_count >= 1 THEN
            RAISE NOTICE '✓ Function % exists', func_name;
        ELSE
            RAISE EXCEPTION '✗ Function % is missing', func_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'All required functions exist!';
END $$;

-- ============================================================================
-- INDEX VALIDATION
-- ============================================================================

DO $$
DECLARE
    index_count INTEGER;
    critical_indexes TEXT[] := ARRAY[
        'idx_contact_messages_created_at',
        'idx_appointments_date_time',
        'idx_outbox_status_send_after',
        'idx_podcast_episodes_published_at',
        'idx_event_log_created_at',
        'idx_profiles_email'
    ];
    index_name TEXT;
BEGIN
    RAISE NOTICE '=== INDEX VALIDATION ===';
    
    FOREACH index_name IN ARRAY critical_indexes LOOP
        SELECT COUNT(*) INTO index_count
        FROM pg_indexes 
        WHERE schemaname = 'public' AND indexname = index_name;
        
        IF index_count = 1 THEN
            RAISE NOTICE '✓ Index % exists', index_name;
        ELSE
            RAISE EXCEPTION '✗ Index % is missing', index_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'All critical indexes exist!';
END $$;

-- ============================================================================
-- FUNCTIONAL TESTS
-- ============================================================================

DO $$
DECLARE
    test_result BOOLEAN;
    test_slots RECORD;
    slot_count INTEGER;
BEGIN
    RAISE NOTICE '=== FUNCTIONAL TESTS ===';
    
    -- Test appointment availability function
    SELECT check_appointment_availability(CURRENT_DATE + 1, '14:00:00') INTO test_result;
    IF test_result = true THEN
        RAISE NOTICE '✓ Appointment availability check works';
    ELSE
        RAISE EXCEPTION '✗ Appointment availability check failed';
    END IF;
    
    -- Test available slots function
    SELECT COUNT(*) INTO slot_count
    FROM get_available_slots(CURRENT_DATE + 1, CURRENT_DATE + 2);
    IF slot_count > 0 THEN
        RAISE NOTICE '✓ Available slots function works (% slots found)', slot_count;
    ELSE
        RAISE NOTICE '⚠ Available slots function works but no slots found (weekend?)';
    END IF;
    
    -- Test event logging
    PERFORM log_event('test_event', '{"test": true}'::jsonb, 'info', 'validation_script');
    RAISE NOTICE '✓ Event logging works';
    
    RAISE NOTICE 'All functional tests passed!';
END $$;

-- ============================================================================
-- CONSTRAINT VALIDATION
-- ============================================================================

DO $$
DECLARE
    constraint_count INTEGER;
BEGIN
    RAISE NOTICE '=== CONSTRAINT VALIDATION ===';
    
    -- Test email constraint
    BEGIN
        INSERT INTO contact_messages (name, email, phone, message, consent_given)
        VALUES ('Test', 'invalid-email', '123456789', 'Test message', true);
        RAISE EXCEPTION '✗ Email constraint not working';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE '✓ Email constraint works';
    END;
    
    -- Test appointment business hours constraint
    BEGIN
        INSERT INTO appointments (
            patient_name, patient_email, patient_phone, 
            appointment_date, appointment_time
        ) VALUES (
            'Test Patient', 'test@example.com', '123456789',
            CURRENT_DATE + 1, '07:00:00'
        );
        RAISE EXCEPTION '✗ Business hours constraint not working';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE '✓ Business hours constraint works';
    END;
    
    RAISE NOTICE 'All constraint tests passed!';
END $$;

-- ============================================================================
-- CLEANUP TEST DATA
-- ============================================================================

-- Clean up any test data created during validation
DELETE FROM event_log WHERE event_type = 'test_event';

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 
    'Database setup validation completed successfully!' as status,
    NOW() as validated_at;

-- Show table statistics
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
-- Run this script AFTER creating the auth users and updating their roles
-- This will link the sample data to the actual user accounts

-- First, verify the function exists (it should be created by script 002)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'setup_demo_data_after_auth') THEN
        RAISE EXCEPTION 'Function setup_demo_data_after_auth() does not exist. Please run 002-create-demo-users.sql first.';
    END IF;
END $$;

-- Call the function to update demo data with real user IDs
SELECT setup_demo_data_after_auth();

-- Clean up the temporary placeholder user (optional)
DO $$
BEGIN
    -- Remove placeholder user if real admin exists
    IF EXISTS (SELECT 1 FROM profiles WHERE email = 'admin@judgingportal.com' AND role = 'admin') THEN
        DELETE FROM profiles WHERE id = '00000000-0000-0000-0000-000000000000';
        DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000000';
        RAISE NOTICE 'Cleaned up temporary placeholder user.';
    ELSE
        RAISE NOTICE 'Keeping placeholder user until real admin is created.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not clean up placeholder user (this is normal): %', SQLERRM;
END $$;

-- Verify the setup
DO $$
DECLARE
    admin_count int;
    judge_count int;
    contestant_count int;
    events_count int;
    assignments_count int;
    real_admin_id uuid;
BEGIN
    -- Count users by role
    SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'admin' AND email != 'temp@system.local';
    SELECT COUNT(*) INTO judge_count FROM profiles WHERE role = 'judge';  
    SELECT COUNT(*) INTO contestant_count FROM profiles WHERE role = 'contestant';
    
    -- Get real admin ID
    SELECT id INTO real_admin_id FROM profiles WHERE email = 'admin@judgingportal.com' AND role = 'admin' LIMIT 1;
    
    -- Count events with real admin
    SELECT COUNT(*) INTO events_count FROM big_events WHERE created_by = real_admin_id;
    SELECT COUNT(*) INTO assignments_count FROM judge_assignments;
    
    RAISE NOTICE '=== SETUP VERIFICATION ===';
    RAISE NOTICE 'Admin users: %', admin_count;
    RAISE NOTICE 'Judge users: %', judge_count;
    RAISE NOTICE 'Contestant users: %', contestant_count;
    RAISE NOTICE 'Events with real admin: %', events_count;
    RAISE NOTICE 'Judge assignments: %', assignments_count;
    
    IF admin_count > 0 AND judge_count > 0 THEN
        RAISE NOTICE 'SUCCESS: Demo setup completed successfully!';
        RAISE NOTICE 'You can now log in with the demo credentials.';
    ELSE
        RAISE NOTICE 'WARNING: Please create auth users and update roles first.';
    END IF;
    RAISE NOTICE '========================';
END $$;

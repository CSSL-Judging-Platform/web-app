-- Add Demo Users Script
-- This script adds the three demo users (admin, judge, contestant) to the system
-- Run this script AFTER the initial schema setup

-- Note: This script uses Supabase's auth.admin functions
-- If these functions are not available, you'll need to create users via Supabase Dashboard

-- Function to create a user with profile
CREATE OR REPLACE FUNCTION create_demo_user(
    user_email TEXT,
    user_password TEXT,
    user_full_name TEXT,
    user_role user_role
)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
    auth_user_data JSONB;
BEGIN
    -- Generate a new UUID for the user
    new_user_id := gen_random_uuid();
    
    -- Try to create user using Supabase auth (may not work in all environments)
    BEGIN
        -- This uses Supabase's admin functions if available
        SELECT auth.admin_create_user(
            user_email,
            user_password,
            true, -- email_confirmed
            user_email,
            user_full_name
        ) INTO auth_user_data;
        
        -- Extract user ID from response
        new_user_id := (auth_user_data->>'id')::UUID;
        
        RAISE NOTICE 'Created auth user via admin function: % (ID: %)', user_email, new_user_id;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Admin function not available for %. Manual creation required: %', user_email, SQLERRM;
            -- Continue with profile creation using generated UUID
    END;
    
    -- Create or update the profile
    INSERT INTO profiles (id, email, full_name, role) 
    VALUES (new_user_id, user_email, user_full_name, user_role)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;
    
    RAISE NOTICE 'Created/updated profile for: % with role: %', user_email, user_role;
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the three demo users
DO $$
DECLARE
    admin_id UUID;
    judge_id UUID;
    contestant_id UUID;
BEGIN
    RAISE NOTICE '=== CREATING DEMO USERS ===';
    
    -- Create Admin User
    BEGIN
        admin_id := create_demo_user(
            'admin@judgingportal.com',
            'admin123',
            'System Administrator',
            'admin'
        );
        RAISE NOTICE 'Admin user created with ID: %', admin_id;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Failed to create admin user: %', SQLERRM;
    END;
    
    -- Create Judge User
    BEGIN
        judge_id := create_demo_user(
            'judge@judgingportal.com',
            'judge123',
            'Dr. Sarah Johnson',
            'judge'
        );
        RAISE NOTICE 'Judge user created with ID: %', judge_id;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Failed to create judge user: %', SQLERRM;
    END;
    
    -- Create Contestant User
    BEGIN
        contestant_id := create_demo_user(
            'contestant@judgingportal.com',
            'contestant123',
            'John Smith',
            'contestant'
        );
        RAISE NOTICE 'Contestant user created with ID: %', contestant_id;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Failed to create contestant user: %', SQLERRM;
    END;
    
    RAISE NOTICE '=== USER CREATION COMPLETED ===';
END $$;

-- Update existing sample data with real admin user if available
DO $$
DECLARE
    real_admin_id UUID;
BEGIN
    -- Get the real admin user ID
    SELECT id INTO real_admin_id 
    FROM profiles 
    WHERE email = 'admin@judgingportal.com' AND role = 'admin' 
    LIMIT 1;
    
    IF real_admin_id IS NOT NULL THEN
        -- Update big events
        UPDATE big_events 
        SET created_by = real_admin_id 
        WHERE created_by = '00000000-0000-0000-0000-000000000000' 
           OR created_by IS NULL;
        
        -- Update small events
        UPDATE small_events 
        SET created_by = real_admin_id 
        WHERE created_by = '00000000-0000-0000-0000-000000000000' 
           OR created_by IS NULL;
        
        RAISE NOTICE 'Updated sample events with real admin ID: %', real_admin_id;
    END IF;
END $$;

-- Create judge assignments if both admin and judge exist
DO $$
DECLARE
    admin_id UUID;
    judge_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO admin_id FROM profiles WHERE email = 'admin@judgingportal.com' AND role = 'admin' LIMIT 1;
    SELECT id INTO judge_id FROM profiles WHERE email = 'judge@judgingportal.com' AND role = 'judge' LIMIT 1;
    
    IF admin_id IS NOT NULL AND judge_id IS NOT NULL THEN
        -- Create judge assignments
        INSERT INTO judge_assignments (judge_id, small_event_id, assigned_by) VALUES 
        (judge_id, '66666666-6666-6666-6666-666666666666', admin_id),
        (judge_id, '77777777-7777-7777-7777-777777777777', admin_id)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Created judge assignments for judge: %', judge_id;
    END IF;
END $$;

-- Verify user creation
DO $$
DECLARE
    user_count INTEGER;
    admin_exists BOOLEAN;
    judge_exists BOOLEAN;
    contestant_exists BOOLEAN;
BEGIN
    -- Count total demo users
    SELECT COUNT(*) INTO user_count 
    FROM profiles 
    WHERE email IN ('admin@judgingportal.com', 'judge@judgingportal.com', 'contestant@judgingportal.com');
    
    -- Check individual users
    SELECT EXISTS(SELECT 1 FROM profiles WHERE email = 'admin@judgingportal.com' AND role = 'admin') INTO admin_exists;
    SELECT EXISTS(SELECT 1 FROM profiles WHERE email = 'judge@judgingportal.com' AND role = 'judge') INTO judge_exists;
    SELECT EXISTS(SELECT 1 FROM profiles WHERE email = 'contestant@judgingportal.com' AND role = 'contestant') INTO contestant_exists;
    
    RAISE NOTICE '=== USER VERIFICATION ===';
    RAISE NOTICE 'Total demo users created: %', user_count;
    RAISE NOTICE 'Admin user exists: %', admin_exists;
    RAISE NOTICE 'Judge user exists: %', judge_exists;
    RAISE NOTICE 'Contestant user exists: %', contestant_exists;
    
    IF admin_exists AND judge_exists AND contestant_exists THEN
        RAISE NOTICE 'SUCCESS: All demo users created successfully!';
        RAISE NOTICE '';
        RAISE NOTICE 'LOGIN CREDENTIALS:';
        RAISE NOTICE 'Admin: admin@judgingportal.com / admin123';
        RAISE NOTICE 'Judge: judge@judgingportal.com / judge123';
        RAISE NOTICE 'Contestant: contestant@judgingportal.com / contestant123';
    ELSE
        RAISE NOTICE 'WARNING: Some users may need manual creation in Supabase Dashboard';
        RAISE NOTICE 'If auth functions are not available, create users manually with these credentials:';
        RAISE NOTICE 'admin@judgingportal.com (password: admin123)';
        RAISE NOTICE 'judge@judgingportal.com (password: judge123)';
        RAISE NOTICE 'contestant@judgingportal.com (password: contestant123)';
    END IF;
    RAISE NOTICE '========================';
END $$;

-- Display current users
SELECT 
    email,
    full_name,
    role,
    created_at
FROM profiles 
WHERE email IN ('admin@judgingportal.com', 'judge@judgingportal.com', 'contestant@judgingportal.com')
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1 
        WHEN 'judge' THEN 2 
        WHEN 'contestant' THEN 3 
    END;

-- Clean up the helper function
DROP FUNCTION IF EXISTS create_demo_user(TEXT, TEXT, TEXT, user_role);

-- Final instructions
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== NEXT STEPS ===';
    RAISE NOTICE '1. If users were created successfully, you can log in immediately';
    RAISE NOTICE '2. If manual creation is needed:';
    RAISE NOTICE '   - Go to Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '   - Create users with the emails and passwords shown above';
    RAISE NOTICE '   - The profiles will be auto-created by trigger';
    RAISE NOTICE '   - Run this script again to update roles and link data';
    RAISE NOTICE '3. Test login with the demo credentials';
    RAISE NOTICE '==================';
END $$;

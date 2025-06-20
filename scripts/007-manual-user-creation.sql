-- Manual User Creation Script
-- Use this script if the automatic user creation doesn't work
-- This script only creates profiles - you must create auth users manually first

-- Step 1: Create auth users manually in Supabase Dashboard with these credentials:
-- admin@judgingportal.com (password: admin123)
-- judge@judgingportal.com (password: judge123)  
-- contestant@judgingportal.com (password: contestant123)

-- Step 2: Run this script to ensure profiles have correct roles

-- Update or create admin profile
INSERT INTO profiles (id, email, full_name, role)
SELECT 
    au.id,
    'admin@judgingportal.com',
    'System Administrator',
    'admin'
FROM auth.users au 
WHERE au.email = 'admin@judgingportal.com'
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- Update or create judge profile
INSERT INTO profiles (id, email, full_name, role)
SELECT 
    au.id,
    'judge@judgingportal.com',
    'Dr. Sarah Johnson',
    'judge'
FROM auth.users au 
WHERE au.email = 'judge@judgingportal.com'
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- Update or create contestant profile
INSERT INTO profiles (id, email, full_name, role)
SELECT 
    au.id,
    'contestant@judgingportal.com',
    'John Smith',
    'contestant'
FROM auth.users au 
WHERE au.email = 'contestant@judgingportal.com'
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- Update sample data with real admin user
DO $$
DECLARE
    real_admin_id UUID;
    judge_id UUID;
BEGIN
    -- Get the real admin user ID
    SELECT p.id INTO real_admin_id 
    FROM profiles p
    JOIN auth.users au ON p.id = au.id
    WHERE p.email = 'admin@judgingportal.com' AND p.role = 'admin' 
    LIMIT 1;
    
    -- Get judge ID
    SELECT p.id INTO judge_id 
    FROM profiles p
    JOIN auth.users au ON p.id = au.id
    WHERE p.email = 'judge@judgingportal.com' AND p.role = 'judge' 
    LIMIT 1;
    
    IF real_admin_id IS NOT NULL THEN
        -- Update big events
        UPDATE big_events 
        SET created_by = real_admin_id 
        WHERE created_by = '00000000-0000-0000-0000-000000000000' 
           OR created_by NOT IN (SELECT id FROM profiles WHERE role = 'admin');
        
        -- Update small events
        UPDATE small_events 
        SET created_by = real_admin_id 
        WHERE created_by = '00000000-0000-0000-0000-000000000000'
           OR created_by NOT IN (SELECT id FROM profiles WHERE role = 'admin');
        
        RAISE NOTICE 'Updated sample events with real admin ID: %', real_admin_id;
        
        -- Create judge assignments
        IF judge_id IS NOT NULL THEN
            INSERT INTO judge_assignments (judge_id, small_event_id, assigned_by) VALUES 
            (judge_id, '66666666-6666-6666-6666-666666666666', real_admin_id),
            (judge_id, '77777777-7777-7777-7777-777777777777', real_admin_id)
            ON CONFLICT DO NOTHING;
            
            RAISE NOTICE 'Created judge assignments for judge: %', judge_id;
        END IF;
    ELSE
        RAISE NOTICE 'Admin user not found. Please create admin@judgingportal.com in Supabase Dashboard first.';
    END IF;
END $$;

-- Verify the setup
SELECT 
    'User Verification' as check_type,
    p.email,
    p.full_name,
    p.role,
    CASE WHEN au.id IS NOT NULL THEN 'Auth User Exists' ELSE 'Auth User Missing' END as auth_status
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.email IN ('admin@judgingportal.com', 'judge@judgingportal.com', 'contestant@judgingportal.com')
ORDER BY 
    CASE p.role 
        WHEN 'admin' THEN 1 
        WHEN 'judge' THEN 2 
        WHEN 'contestant' THEN 3 
    END;

-- Final verification message
DO $$
DECLARE
    auth_user_count INTEGER;
    profile_count INTEGER;
BEGIN
    -- Count auth users
    SELECT COUNT(*) INTO auth_user_count 
    FROM auth.users 
    WHERE email IN ('admin@judgingportal.com', 'judge@judgingportal.com', 'contestant@judgingportal.com');
    
    -- Count profiles
    SELECT COUNT(*) INTO profile_count 
    FROM profiles 
    WHERE email IN ('admin@judgingportal.com', 'judge@judgingportal.com', 'contestant@judgingportal.com');
    
    RAISE NOTICE '=== MANUAL SETUP VERIFICATION ===';
    RAISE NOTICE 'Auth users found: %', auth_user_count;
    RAISE NOTICE 'Profiles created: %', profile_count;
    
    IF auth_user_count = 3 AND profile_count = 3 THEN
        RAISE NOTICE 'SUCCESS: All users created and linked successfully!';
        RAISE NOTICE '';
        RAISE NOTICE 'LOGIN CREDENTIALS:';
        RAISE NOTICE 'Admin: admin@judgingportal.com / admin123';
        RAISE NOTICE 'Judge: judge@judgingportal.com / judge123';
        RAISE NOTICE 'Contestant: contestant@judgingportal.com / contestant123';
    ELSE
        RAISE NOTICE 'INCOMPLETE: Please create missing auth users in Supabase Dashboard';
    END IF;
    RAISE NOTICE '================================';
END $$;

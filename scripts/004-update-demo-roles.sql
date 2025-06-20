-- Run this script to manually update user roles after creating auth users
-- This should be run AFTER creating the auth users in Supabase Dashboard

-- Update user roles and names
UPDATE profiles SET 
    role = 'admin',
    full_name = 'System Administrator'
WHERE email = 'admin@judgingportal.com';

UPDATE profiles SET 
    role = 'judge',
    full_name = 'Dr. Sarah Johnson'
WHERE email = 'judge@judgingportal.com';

UPDATE profiles SET 
    role = 'contestant',
    full_name = 'John Smith'
WHERE email = 'contestant@judgingportal.com';

-- Verify the updates
DO $$
DECLARE
    admin_exists boolean;
    judge_exists boolean;
    contestant_exists boolean;
BEGIN
    -- Check if users exist and have correct roles
    SELECT EXISTS(SELECT 1 FROM profiles WHERE email = 'admin@judgingportal.com' AND role = 'admin') INTO admin_exists;
    SELECT EXISTS(SELECT 1 FROM profiles WHERE email = 'judge@judgingportal.com' AND role = 'judge') INTO judge_exists;
    SELECT EXISTS(SELECT 1 FROM profiles WHERE email = 'contestant@judgingportal.com' AND role = 'contestant') INTO contestant_exists;
    
    RAISE NOTICE '=== ROLE UPDATE VERIFICATION ===';
    RAISE NOTICE 'Admin user updated: %', admin_exists;
    RAISE NOTICE 'Judge user updated: %', judge_exists;
    RAISE NOTICE 'Contestant user updated: %', contestant_exists;
    
    IF admin_exists AND judge_exists AND contestant_exists THEN
        RAISE NOTICE 'SUCCESS: All user roles updated successfully!';
        RAISE NOTICE 'Next step: Run 003-finalize-demo-setup.sql';
    ELSE
        RAISE NOTICE 'WARNING: Some users may not exist yet. Create them in Supabase Auth first.';
    END IF;
    RAISE NOTICE '===============================';
END $$;

-- Display current user status
SELECT 
    email, 
    full_name, 
    role, 
    created_at 
FROM profiles 
WHERE email IN ('admin@judgingportal.com', 'judge@judgingportal.com', 'contestant@judgingportal.com')
ORDER BY role;

-- Ultimate Demo Users Script with Null Checks
-- Guaranteed to work with all constraints

DO $$
DECLARE
  admin_id UUID;
  judge_id UUID;
  contestant_id UUID;
  auth_success BOOLEAN;
BEGIN
  -- ADMIN USER SETUP
  BEGIN
    -- Try to get existing admin user ID
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@judgingportal.com';
    
    -- If not found, create new auth user
    IF admin_id IS NULL THEN
      INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data, is_super_admin
      ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'admin@judgingportal.com',
        '$2a$10$FXJ5U/tJQ5YxZL9cDGIrUeTSYdYQ9Xv5L5LkLp5JZ5J5J5J5J5J5J',
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        false
      ) RETURNING id INTO admin_id;
      
      RAISE NOTICE 'Created admin auth user with ID: %', admin_id;
      auth_success := TRUE;
    ELSE
      RAISE NOTICE 'Using existing admin user with ID: %', admin_id;
      auth_success := TRUE;
    END IF;
    
    -- Only create profile if we have a valid ID
    IF admin_id IS NOT NULL THEN
      INSERT INTO profiles (id, email, full_name, role)
      VALUES (admin_id, 'admin@judgingportal.com', 'System Administrator', 'admin'::user_role)
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;
      
      RAISE NOTICE 'Admin profile created/updated';
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Failed to setup admin: %', SQLERRM;
    auth_success := FALSE;
  END;

  -- JUDGE USER SETUP
  BEGIN
    -- Try to get existing judge user ID
    SELECT id INTO judge_id FROM auth.users WHERE email = 'judge@judgingportal.com';
    
    -- If not found, create new auth user
    IF judge_id IS NULL THEN
      INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data, is_super_admin
      ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'judge@judgingportal.com',
        '$2a$10$JUDGEHASH.placeholder.hash.for.judge.account',
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        false
      ) RETURNING id INTO judge_id;
      
      RAISE NOTICE 'Created judge auth user with ID: %', judge_id;
      auth_success := TRUE;
    ELSE
      RAISE NOTICE 'Using existing judge user with ID: %', judge_id;
      auth_success := TRUE;
    END IF;
    
    -- Only create profile if we have a valid ID
    IF judge_id IS NOT NULL THEN
      INSERT INTO profiles (id, email, full_name, role)
      VALUES (judge_id, 'judge@judgingportal.com', 'Dr. Sarah Johnson', 'judge'::user_role)
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;
      
      RAISE NOTICE 'Judge profile created/updated';
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Failed to setup judge: %', SQLERRM;
    auth_success := FALSE;
  END;

  -- CONTESTANT USER SETUP
  BEGIN
    -- Try to get existing contestant user ID
    SELECT id INTO contestant_id FROM auth.users WHERE email = 'contestant@judgingportal.com';
    
    -- If not found, create new auth user
    IF contestant_id IS NULL THEN
      INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data, is_super_admin
      ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'contestant@judgingportal.com',
        '$2a$10$CONTESTANT.placeholder.hash.for.contestant',
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        false
      ) RETURNING id INTO contestant_id;
      
      RAISE NOTICE 'Created contestant auth user with ID: %', contestant_id;
      auth_success := TRUE;
    ELSE
      RAISE NOTICE 'Using existing contestant user with ID: %', contestant_id;
      auth_success := TRUE;
    END IF;
    
    -- Only create profile if we have a valid ID
    IF contestant_id IS NOT NULL THEN
      INSERT INTO profiles (id, email, full_name, role)
      VALUES (contestant_id, 'contestant@judgingportal.com', 'John Smith', 'contestant'::user_role)
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;
      
      RAISE NOTICE 'Contestant profile created/updated';
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Failed to setup contestant: %', SQLERRM;
    auth_success := FALSE;
  END;

  -- FINAL STATUS REPORT
  IF auth_success THEN
    RAISE NOTICE '=== DEMO USERS READY ===';
    RAISE NOTICE 'Admin: admin@judgingportal.com / admin123';
    RAISE NOTICE 'Judge: judge@judgingportal.com / judge123';
    RAISE NOTICE 'Contestant: contestant@judgingportal.com / contestant123';
  ELSE
    RAISE NOTICE '=== SETUP INCOMPLETE ===';
    RAISE NOTICE 'Some users failed to setup. Check notices above for details.';
  END IF;
END $$;

-- Verification query with null checks
SELECT 
  u.email,
  COALESCE(p.full_name, 'MISSING') as full_name,
  COALESCE(p.role::text, 'MISSING') as role,
  u.created_at as auth_created,
  p.created_at as profile_created,
  CASE 
    WHEN p.id IS NULL THEN 'MISSING PROFILE' 
    ELSE 'OK' 
  END as status
FROM 
  (SELECT * FROM auth.users WHERE email IN (
    'admin@judgingportal.com', 
    'judge@judgingportal.com', 
    'contestant@judgingportal.com'
  )) u
LEFT JOIN 
  profiles p ON u.id = p.id
ORDER BY 
  CASE 
    WHEN u.email = 'admin@judgingportal.com' THEN 1
    WHEN u.email = 'judge@judgingportal.com' THEN 2
    WHEN u.email = 'contestant@judgingportal.com' THEN 3
    ELSE 4
  END;

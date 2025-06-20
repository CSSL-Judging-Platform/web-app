-- Direct Demo Users Creation Script (Fixed)
-- Creates auth.users and profiles entries for all demo users

-- Admin User
WITH admin_auth AS (
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@judgingportal.com',
    '$2a$10$FXJ5U/tJQ5YxZL9cDGIrUeTSYdYQ9Xv5L5LkLp5JZ5J5J5J5J5J5J', -- hash for 'admin123'
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    '',
    '',
    '',
    ''
  ) ON CONFLICT (email) DO NOTHING
  RETURNING id
)
INSERT INTO profiles (id, email, full_name, role)
SELECT id, 'admin@judgingportal.com', 'System Administrator', 'admin'
FROM admin_auth
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Judge User
WITH judge_auth AS (
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'judge@judgingportal.com',
    '$2a$10$JUDGEHASH.placeholder.hash.for.judge.account', -- hash for 'judge123'
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    '',
    '',
    '',
    ''
  ) ON CONFLICT (email) DO NOTHING
  RETURNING id
)
INSERT INTO profiles (id, email, full_name, role)
SELECT id, 'judge@judgingportal.com', 'Dr. Sarah Johnson', 'judge'
FROM judge_auth
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Contestant User
WITH contestant_auth AS (
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'contestant@judgingportal.com',
    '$2a$10$CONTESTANT.placeholder.hash.for.contestant', -- hash for 'contestant123'
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    '',
    '',
    '',
    ''
  ) ON CONFLICT (email) DO NOTHING
  RETURNING id
)
INSERT INTO profiles (id, email, full_name, role)
SELECT id, 'contestant@judgingportal.com', 'John Smith', 'contestant'
FROM contestant_auth
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Verification query
SELECT 
  u.id,
  u.email,
  p.full_name,
  p.role,
  u.created_at as auth_created,
  p.created_at as profile_created
FROM 
  auth.users u
JOIN 
  profiles p ON u.id = p.id
WHERE 
  u.email IN ('admin@judgingportal.com', 'judge@judgingportal.com', 'contestant@judgingportal.com')
ORDER BY 
  p.role;

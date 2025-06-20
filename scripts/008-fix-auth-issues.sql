-- Fix Authentication and Database Issues
-- This script addresses login problems and ensures proper schema setup

-- First, let's check and fix any RLS policy issues
DO $$
BEGIN
    RAISE NOTICE '=== CHECKING DATABASE SCHEMA ===';
END $$;

-- Ensure all required tables exist with proper structure
DO $$
BEGIN
    -- Check if profiles table has the right structure
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'role') THEN
        RAISE EXCEPTION 'Profiles table missing role column';
    END IF;
    
    RAISE NOTICE 'Schema check passed';
END $$;

-- Fix RLS policies that might be causing issues
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;

-- Recreate RLS policies with better error handling
CREATE POLICY "Users can view own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can insert profiles" ON profiles 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) OR auth.uid() = id
);

-- Add a policy for the trigger to create profiles
CREATE POLICY "System can insert profiles" ON profiles 
FOR INSERT WITH CHECK (true);

-- Fix the user creation trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 
    'contestant'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    RAISE WARNING 'Failed to create profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ language plpgsql security definer;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Ensure demo users have proper profiles
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT id, email FROM auth.users 
        WHERE email IN ('admin@judgingportal.com', 'judge@judgingportal.com', 'contestant@judgingportal.com')
    LOOP
        INSERT INTO profiles (id, email, full_name, role)
        VALUES (
            user_record.id,
            user_record.email,
            CASE 
                WHEN user_record.email = 'admin@judgingportal.com' THEN 'System Administrator'
                WHEN user_record.email = 'judge@judgingportal.com' THEN 'Dr. Sarah Johnson'
                WHEN user_record.email = 'contestant@judgingportal.com' THEN 'John Smith'
                ELSE split_part(user_record.email, '@', 1)
            END,
            CASE 
                WHEN user_record.email = 'admin@judgingportal.com' THEN 'admin'::user_role
                WHEN user_record.email = 'judge@judgingportal.com' THEN 'judge'::user_role
                WHEN user_record.email = 'contestant@judgingportal.com' THEN 'contestant'::user_role
                ELSE 'contestant'::user_role
            END
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role;
        
        RAISE NOTICE 'Profile ensured for: %', user_record.email;
    END LOOP;
END $$;

-- Verify the setup
SELECT 
    u.email,
    p.full_name,
    p.role,
    'OK' as status
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email IN ('admin@judgingportal.com', 'judge@judgingportal.com', 'contestant@judgingportal.com')
ORDER BY p.role;

RAISE NOTICE '=== AUTH SETUP COMPLETED ===';

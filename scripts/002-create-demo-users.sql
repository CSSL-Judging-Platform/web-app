-- Demo Users Setup - Fixed Version
-- This script creates sample data without foreign key constraint violations

-- First, create a temporary admin profile to satisfy foreign key constraints
-- This will be updated later with real user data
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
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'temp@system.local',
  '$2a$10$placeholder.hash.for.temp.user.account.creation',
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
) ON CONFLICT (id) DO NOTHING;

-- Create temporary profile for the placeholder user
INSERT INTO profiles (id, email, full_name, role) VALUES 
(
  '00000000-0000-0000-0000-000000000000',
  'temp@system.local',
  'System Placeholder',
  'admin'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Now create sample big events with the placeholder admin
INSERT INTO big_events (id, name, description, start_date, end_date, status, created_by) VALUES 
(
  '44444444-4444-4444-4444-444444444444',
  'Tech Summit 2024',
  'Annual technology summit featuring innovation competitions and presentations',
  '2024-03-15',
  '2024-03-17',
  'active',
  '00000000-0000-0000-0000-000000000000'
),
(
  '55555555-5555-5555-5555-555555555555',
  'Innovation Expo',
  'Showcase of cutting-edge innovations and research projects',
  '2024-04-20',
  '2024-04-22',
  'draft',
  '00000000-0000-0000-0000-000000000000'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  status = EXCLUDED.status;

-- Create sample small events
INSERT INTO small_events (id, big_event_id, name, description, start_date, end_date, status, allow_registration, created_by) VALUES 
(
  '66666666-6666-6666-6666-666666666666',
  '44444444-4444-4444-4444-444444444444',
  'Best Undergraduate Project',
  'Competition for the most innovative undergraduate project',
  '2024-03-15 09:00:00+00',
  '2024-03-15 17:00:00+00',
  'active',
  true,
  '00000000-0000-0000-0000-000000000000'
),
(
  '77777777-7777-7777-7777-777777777777',
  '44444444-4444-4444-4444-444444444444',
  'Innovation Challenge',
  'Challenge to create innovative solutions for real-world problems',
  '2024-03-16 09:00:00+00',
  '2024-03-16 17:00:00+00',
  'active',
  true,
  '00000000-0000-0000-0000-000000000000'
),
(
  '88888888-8888-8888-8888-888888888888',
  '55555555-5555-5555-5555-555555555555',
  'Research Presentation',
  'Presentation of research findings and methodologies',
  '2024-04-20 10:00:00+00',
  '2024-04-20 16:00:00+00',
  'draft',
  false,
  '00000000-0000-0000-0000-000000000000'
) ON CONFLICT (id) DO UPDATE SET
  big_event_id = EXCLUDED.big_event_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  status = EXCLUDED.status,
  allow_registration = EXCLUDED.allow_registration;

-- Create judging criteria for the small events
INSERT INTO judging_criteria (small_event_id, name, description, max_points, weight, order_index) VALUES 
-- Criteria for Best Undergraduate Project
('66666666-6666-6666-6666-666666666666', 'Innovation', 'Originality and creativity of the solution', 25, 1.0, 1),
('66666666-6666-6666-6666-666666666666', 'Technical Implementation', 'Quality of technical execution and code', 25, 1.0, 2),
('66666666-6666-6666-6666-666666666666', 'Presentation', 'Clarity and effectiveness of presentation', 25, 1.0, 3),
('66666666-6666-6666-6666-666666666666', 'Impact', 'Potential real-world impact and usefulness', 25, 1.0, 4),

-- Criteria for Innovation Challenge
('77777777-7777-7777-7777-777777777777', 'Problem Solving', 'Effectiveness in addressing the given problem', 30, 1.0, 1),
('77777777-7777-7777-7777-777777777777', 'Creativity', 'Creative approach and thinking outside the box', 25, 1.0, 2),
('77777777-7777-7777-7777-777777777777', 'Feasibility', 'Practicality and implementability of solution', 25, 1.0, 3),
('77777777-7777-7777-7777-777777777777', 'Team Collaboration', 'Evidence of effective teamwork', 20, 1.0, 4),

-- Criteria for Research Presentation
('88888888-8888-8888-8888-888888888888', 'Research Quality', 'Depth and rigor of research methodology', 30, 1.0, 1),
('88888888-8888-8888-8888-888888888888', 'Data Analysis', 'Quality of data collection and analysis', 25, 1.0, 2),
('88888888-8888-8888-8888-888888888888', 'Presentation Skills', 'Clarity and professionalism of presentation', 25, 1.0, 3),
('88888888-8888-8888-8888-888888888888', 'Contribution to Field', 'Significance of contribution to the field', 20, 1.0, 4)
ON CONFLICT DO NOTHING;

-- Add some sample contestants (these don't require user IDs)
INSERT INTO contestants (small_event_id, contestant_name, contestant_email, registration_number, additional_info) VALUES 
-- Contestants for Best Undergraduate Project
('66666666-6666-6666-6666-666666666666', 'Alice Johnson', 'alice.johnson@university.edu', 'UG001', '{"major": "Computer Science", "year": "Senior"}'),
('66666666-6666-6666-6666-666666666666', 'Bob Chen', 'bob.chen@university.edu', 'UG002', '{"major": "Software Engineering", "year": "Senior"}'),
('66666666-6666-6666-6666-666666666666', 'Carol Davis', 'carol.davis@university.edu', 'UG003', '{"major": "Information Technology", "year": "Senior"}'),

-- Contestants for Innovation Challenge
('77777777-7777-7777-7777-777777777777', 'David Wilson', 'david.wilson@university.edu', 'IC001', '{"team": "Tech Innovators", "members": 4}'),
('77777777-7777-7777-7777-777777777777', 'Emma Brown', 'emma.brown@university.edu', 'IC002', '{"team": "Future Solutions", "members": 3}'),
('77777777-7777-7777-7777-777777777777', 'Frank Miller', 'frank.miller@university.edu', 'IC003', '{"team": "Code Breakers", "members": 5}')
ON CONFLICT DO NOTHING;

-- Create a function to update demo data after real users are created
CREATE OR REPLACE FUNCTION setup_demo_data_after_auth()
RETURNS void AS $$
DECLARE
    admin_id uuid;
    judge_id uuid;
BEGIN
    -- Get the admin user ID
    SELECT id INTO admin_id FROM profiles WHERE email = 'admin@judgingportal.com' AND role = 'admin' LIMIT 1;
    
    -- Get the judge user ID  
    SELECT id INTO judge_id FROM profiles WHERE email = 'judge@judgingportal.com' AND role = 'judge' LIMIT 1;
    
    -- Update big events with real admin ID
    IF admin_id IS NOT NULL THEN
        UPDATE big_events 
        SET created_by = admin_id 
        WHERE created_by = '00000000-0000-0000-0000-000000000000';
        
        UPDATE small_events 
        SET created_by = admin_id 
        WHERE created_by = '00000000-0000-0000-0000-000000000000';
        
        RAISE NOTICE 'Updated events with admin user ID: %', admin_id;
    ELSE
        RAISE NOTICE 'Admin user not found. Please create admin@judgingportal.com first.';
    END IF;
    
    -- Create judge assignments if both admin and judge exist
    IF judge_id IS NOT NULL AND admin_id IS NOT NULL THEN
        INSERT INTO judge_assignments (judge_id, small_event_id, assigned_by) VALUES 
        (judge_id, '66666666-6666-6666-6666-666666666666', admin_id),
        (judge_id, '77777777-7777-7777-7777-777777777777', admin_id)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Created judge assignments for judge ID: %', judge_id;
    ELSE
        RAISE NOTICE 'Judge user not found. Please create judge@judgingportal.com first.';
    END IF;
    
END;
$$ LANGUAGE plpgsql;

-- Display setup instructions
DO $$
BEGIN
    RAISE NOTICE '=== DEMO SETUP INSTRUCTIONS ===';
    RAISE NOTICE '1. Create these auth users in Supabase Dashboard > Authentication > Users:';
    RAISE NOTICE '   - admin@judgingportal.com (password: admin123)';
    RAISE NOTICE '   - judge@judgingportal.com (password: judge123)';
    RAISE NOTICE '   - contestant@judgingportal.com (password: contestant123)';
    RAISE NOTICE '2. Update user roles using: 004-update-demo-roles.sql';
    RAISE NOTICE '3. Finalize setup using: 003-finalize-demo-setup.sql';
    RAISE NOTICE '4. Sample data created successfully with placeholder admin!';
    RAISE NOTICE '================================';
END $$;

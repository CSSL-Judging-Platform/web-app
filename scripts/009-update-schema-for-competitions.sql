-- Update schema to reflect "competitions" terminology instead of "small_events"

-- Rename small_events table to competitions
ALTER TABLE small_events RENAME TO competitions;

-- Update foreign key references in other tables
ALTER TABLE judging_criteria RENAME COLUMN small_event_id TO competition_id;
ALTER TABLE contestants RENAME COLUMN small_event_id TO competition_id;
ALTER TABLE judge_assignments RENAME COLUMN small_event_id TO competition_id;
ALTER TABLE judge_submissions RENAME COLUMN small_event_id TO competition_id;

-- Update RLS policies to use new table name
DROP POLICY IF EXISTS "Everyone can view active small events" ON competitions;
DROP POLICY IF EXISTS "Judges can view assigned small events" ON competitions;
DROP POLICY IF EXISTS "Admins can manage small events" ON competitions;

CREATE POLICY "Everyone can view active competitions" ON competitions FOR SELECT USING (status = 'active');
CREATE POLICY "Judges can view assigned competitions" ON competitions FOR SELECT USING (
  EXISTS (SELECT 1 FROM judge_assignments WHERE judge_id = auth.uid() AND competition_id = id)
);
CREATE POLICY "Admins can manage competitions" ON competitions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Update criteria policy
DROP POLICY IF EXISTS "Everyone can view criteria for active events" ON judging_criteria;
CREATE POLICY "Everyone can view criteria for active competitions" ON judging_criteria FOR SELECT USING (
  EXISTS (SELECT 1 FROM competitions WHERE id = competition_id AND status = 'active')
);

-- Update contestants policy
DROP POLICY IF EXISTS "Everyone can view contestants for active events" ON contestants;
CREATE POLICY "Everyone can view contestants for active competitions" ON contestants FOR SELECT USING (
  EXISTS (SELECT 1 FROM competitions WHERE id = competition_id AND status = 'active')
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_competitions_big_event_id ON competitions(big_event_id);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_judge_assignments_judge_id ON judge_assignments(judge_id);
CREATE INDEX IF NOT EXISTS idx_judge_assignments_competition_id ON judge_assignments(competition_id);
CREATE INDEX IF NOT EXISTS idx_contestants_competition_id ON contestants(competition_id);
CREATE INDEX IF NOT EXISTS idx_judging_criteria_competition_id ON judging_criteria(competition_id);
CREATE INDEX IF NOT EXISTS idx_scores_judge_contestant ON scores(judge_id, contestant_id);

-- Update trigger for competitions table
CREATE TRIGGER update_competitions_updated_at BEFORE UPDATE ON competitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add sample data for testing
INSERT INTO competitions (id, big_event_id, name, description, start_date, end_date, status, allow_registration, created_by) VALUES
('comp-1', '1', 'Best Undergraduate Project', 'Competition for the most innovative undergraduate project', '2024-03-15 09:00:00+00', '2024-03-15 17:00:00+00', 'active', true, (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
('comp-2', '1', 'Innovation Challenge', 'Challenge to create innovative solutions for real-world problems', '2024-03-16 09:00:00+00', '2024-03-16 17:00:00+00', 'active', true, (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
('comp-3', '2', 'Research Presentation', 'Presentation of research findings and methodologies', '2024-02-20 09:00:00+00', '2024-02-20 17:00:00+00', 'completed', false, (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1))
ON CONFLICT (id) DO NOTHING;

-- Add judging criteria for competitions
INSERT INTO judging_criteria (id, competition_id, name, description, max_points, weight, order_index) VALUES
('criteria-1', 'comp-1', 'Innovation', 'Originality and creativity of the solution', 25, 1.0, 1),
('criteria-2', 'comp-1', 'Technical Implementation', 'Quality of technical execution and code', 30, 1.0, 2),
('criteria-3', 'comp-1', 'Presentation', 'Clarity and effectiveness of presentation', 25, 1.0, 3),
('criteria-4', 'comp-1', 'Impact', 'Potential real-world impact and usefulness', 20, 1.0, 4),
('criteria-5', 'comp-2', 'Problem Solving', 'Effectiveness in addressing the given problem', 30, 1.0, 1),
('criteria-6', 'comp-2', 'Innovation', 'Creative and novel approach to the solution', 25, 1.0, 2),
('criteria-7', 'comp-2', 'Feasibility', 'Practicality and implementability of the solution', 25, 1.0, 3),
('criteria-8', 'comp-2', 'Presentation Quality', 'Quality of presentation and communication', 20, 1.0, 4)
ON CONFLICT (id) DO NOTHING;

-- Add sample contestants
INSERT INTO contestants (id, competition_id, contestant_name, contestant_email, registration_number, additional_info) VALUES
('contestant-1', 'comp-1', 'Alice Johnson', 'alice.johnson@university.edu', 'UG001', '{"project_title": "AI-Powered Learning Assistant", "project_description": "An intelligent tutoring system that adapts to individual learning styles"}'),
('contestant-2', 'comp-1', 'Bob Chen', 'bob.chen@university.edu', 'UG002', '{"project_title": "Sustainable Energy Monitor", "project_description": "IoT device for monitoring and optimizing home energy consumption"}'),
('contestant-3', 'comp-1', 'Carol Davis', 'carol.davis@university.edu', 'UG003', '{"project_title": "Mental Health Chatbot", "project_description": "AI chatbot providing mental health support for students"}'),
('contestant-4', 'comp-2', 'David Wilson', 'david.wilson@university.edu', 'UG004', '{"project_title": "Smart City Traffic System", "project_description": "AI-based traffic optimization system for urban areas"}')
ON CONFLICT (id) DO NOTHING;  "AI-based traffic optimization system for urban areas"}')
ON CONFLICT (id) DO NOTHING;

-- Add judge assignments
INSERT INTO judge_assignments (id, judge_id, competition_id, assigned_by) VALUES
('assignment-1', (SELECT id FROM profiles WHERE email = 'sarah.smith@university.edu' LIMIT 1), 'comp-1', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
('assignment-2', (SELECT id FROM profiles WHERE email = 'michael.johnson@university.edu' LIMIT 1), 'comp-1', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
('assignment-3', (SELECT id FROM profiles WHERE email = 'sarah.smith@university.edu' LIMIT 1), 'comp-2', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1))
ON CONFLICT (id) DO NOTHING;

-- Add sample scores
INSERT INTO scores (id, judge_id, contestant_id, criteria_id, score, feedback, is_draft) VALUES
('score-1', (SELECT id FROM profiles WHERE email = 'sarah.smith@university.edu' LIMIT 1), 'contestant-1', 'criteria-1', 22, 'Excellent innovative approach with unique features', false),
('score-2', (SELECT id FROM profiles WHERE email = 'sarah.smith@university.edu' LIMIT 1), 'contestant-1', 'criteria-2', 28, 'Strong technical implementation with clean code', false),
('score-3', (SELECT id FROM profiles WHERE email = 'sarah.smith@university.edu' LIMIT 1), 'contestant-1', 'criteria-3', 23, 'Clear and engaging presentation style', false),
('score-4', (SELECT id FROM profiles WHERE email = 'sarah.smith@university.edu' LIMIT 1), 'contestant-1', 'criteria-4', 18, 'Good potential for real-world application', false)
ON CONFLICT (id) DO NOTHING;

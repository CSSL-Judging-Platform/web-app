-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'judge', 'contestant');
CREATE TYPE event_status AS ENUM ('draft', 'active', 'completed', 'cancelled');

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'contestant',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Big Events table
CREATE TABLE big_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status event_status DEFAULT 'draft',
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Small Events (Competitions) table
CREATE TABLE small_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  big_event_id UUID REFERENCES big_events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status event_status DEFAULT 'draft',
  allow_registration BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Judging Criteria table
CREATE TABLE judging_criteria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  small_event_id UUID REFERENCES small_events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  max_points INTEGER NOT NULL DEFAULT 100,
  weight DECIMAL(3,2) DEFAULT 1.0,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contestants table
CREATE TABLE contestants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  small_event_id UUID REFERENCES small_events(id) ON DELETE CASCADE NOT NULL,
  contestant_name TEXT NOT NULL,
  contestant_email TEXT,
  registration_number TEXT,
  additional_info JSONB DEFAULT '{}',
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(small_event_id, contestant_email)
);

-- Judge Assignments table
CREATE TABLE judge_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judge_id UUID REFERENCES profiles(id) NOT NULL,
  small_event_id UUID REFERENCES small_events(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES profiles(id) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(judge_id, small_event_id)
);

-- Scores table
CREATE TABLE scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judge_id UUID REFERENCES profiles(id) NOT NULL,
  contestant_id UUID REFERENCES contestants(id) ON DELETE CASCADE NOT NULL,
  criteria_id UUID REFERENCES judging_criteria(id) ON DELETE CASCADE NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  feedback TEXT,
  is_draft BOOLEAN DEFAULT true,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(judge_id, contestant_id, criteria_id)
);

-- Judge submissions tracking
CREATE TABLE judge_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judge_id UUID REFERENCES profiles(id) NOT NULL,
  contestant_id UUID REFERENCES contestants(id) ON DELETE CASCADE NOT NULL,
  small_event_id UUID REFERENCES small_events(id) ON DELETE CASCADE NOT NULL,
  is_final BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(judge_id, contestant_id, small_event_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE big_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE small_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE judging_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE contestants ENABLE ROW LEVEL SECURITY;
ALTER TABLE judge_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE judge_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Big Events
CREATE POLICY "Everyone can view active big events" ON big_events FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage big events" ON big_events FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Small Events
CREATE POLICY "Everyone can view active small events" ON small_events FOR SELECT USING (status = 'active');
CREATE POLICY "Judges can view assigned small events" ON small_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM judge_assignments WHERE judge_id = auth.uid() AND small_event_id = id)
);
CREATE POLICY "Admins can manage small events" ON small_events FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Judging Criteria
CREATE POLICY "Everyone can view criteria for active events" ON judging_criteria FOR SELECT USING (
  EXISTS (SELECT 1 FROM small_events WHERE id = small_event_id AND status = 'active')
);
CREATE POLICY "Admins can manage criteria" ON judging_criteria FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Contestants
CREATE POLICY "Everyone can view contestants for active events" ON contestants FOR SELECT USING (
  EXISTS (SELECT 1 FROM small_events WHERE id = small_event_id AND status = 'active')
);
CREATE POLICY "Admins can manage contestants" ON contestants FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Judge Assignments
CREATE POLICY "Judges can view own assignments" ON judge_assignments FOR SELECT USING (judge_id = auth.uid());
CREATE POLICY "Admins can manage assignments" ON judge_assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Scores
CREATE POLICY "Judges can manage own scores" ON scores FOR ALL USING (judge_id = auth.uid());
CREATE POLICY "Admins can view all scores" ON scores FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Judge Submissions
CREATE POLICY "Judges can manage own submissions" ON judge_submissions FOR ALL USING (judge_id = auth.uid());
CREATE POLICY "Admins can view all submissions" ON judge_submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Functions and Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_big_events_updated_at BEFORE UPDATE ON big_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_small_events_updated_at BEFORE UPDATE ON small_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email), 'contestant');
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger to automatically create profile for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

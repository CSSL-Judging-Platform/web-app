# Demo Users Setup Instructions (Fixed)

## Step 1: Run the Initial SQL Script
Execute `002-create-demo-users.sql` in your Supabase SQL editor.
This creates sample data with placeholder admin IDs.

## Step 2: Create Auth Users in Supabase Dashboard

Go to **Supabase Dashboard → Authentication → Users → Add User**

Create these three users (Supabase will auto-generate UUIDs):

### 1. Admin User
- **Email**: `admin@judgingportal.com`
- **Password**: `admin123`
- **Email Confirmed**: ✅ Yes
- **Auto Confirm**: ✅ Yes

### 2. Judge User  
- **Email**: `judge@judgingportal.com`
- **Password**: `judge123`
- **Email Confirmed**: ✅ Yes
- **Auto Confirm**: ✅ Yes

### 3. Contestant User
- **Email**: `contestant@judgingportal.com`
- **Password**: `contestant123`
- **Email Confirmed**: ✅ Yes
- **Auto Confirm**: ✅ Yes

## Step 3: Update User Roles

After creating the auth users, you need to update their roles in the profiles table:

\`\`\`sql
-- Update roles for the demo users
UPDATE profiles SET role = 'admin' WHERE email = 'admin@judgingportal.com';
UPDATE profiles SET role = 'judge' WHERE email = 'judge@judgingportal.com';  
UPDATE profiles SET role = 'contestant' WHERE email = 'contestant@judgingportal.com';
\`\`\`

## Step 4: Finalize Demo Setup
Execute `003-finalize-demo-setup.sql` to link sample data to real user accounts.

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@judgingportal.com` | `admin123` |
| **Judge** | `judge@judgingportal.com` | `judge123` |
| **Contestant** | `contestant@judgingportal.com` | `contestant123` |

## What This Creates

✅ **Sample Big Events**: Tech Summit 2024, Innovation Expo  
✅ **Sample Small Events**: Best Undergraduate Project, Innovation Challenge, Research Presentation  
✅ **Judging Criteria**: Complete scoring rubrics for each event  
✅ **Sample Contestants**: 6 test contestants across events  
✅ **Judge Assignments**: Judge assigned to active events  

## Troubleshooting

If you get foreign key errors:
1. Make sure auth users are created first
2. Check that profiles were auto-created by the trigger
3. Update roles manually if needed
4. Run the finalize script to link data

## Important Notes

⚠️ **Order Matters**: Create auth users first, then run finalize script  
⚠️ **Auto-Generated UUIDs**: Don't worry about specific UUIDs - Supabase handles this  
⚠️ **Profile Creation**: Profiles are auto-created by trigger when auth users are created  
⚠️ **Role Updates**: You may need to manually update roles after user creation

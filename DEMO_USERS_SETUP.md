# Demo Users Setup Instructions

## Step 1: Run the SQL Script
Execute the `002-create-demo-users.sql` script in your Supabase SQL editor.

## Step 2: Create Auth Users in Supabase Dashboard

Since Supabase manages the `auth.users` table, you need to create the corresponding auth users manually:

### Go to Supabase Dashboard → Authentication → Users → Add User

Create these three users with **EXACT** UUIDs and credentials:

### 1. Admin User
- **User ID**: `11111111-1111-1111-1111-111111111111`
- **Email**: `admin@judgingportal.com`
- **Password**: `admin123`
- **Email Confirmed**: ✅ Yes
- **Phone Confirmed**: ❌ No

### 2. Judge User  
- **User ID**: `22222222-2222-2222-2222-222222222222`
- **Email**: `judge@judgingportal.com`
- **Password**: `judge123`
- **Email Confirmed**: ✅ Yes
- **Phone Confirmed**: ❌ No

### 3. Contestant User
- **User ID**: `33333333-3333-3333-3333-333333333333`
- **Email**: `contestant@judgingportal.com`
- **Password**: `contestant123`
- **Email Confirmed**: ✅ Yes
- **Phone Confirmed**: ❌ No

## Step 3: Verify Setup

After creating the auth users, verify that:

1. The profiles exist in the `profiles` table
2. Each profile has the correct role assigned
3. You can log in with each set of credentials

## Login Credentials Summary

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@judgingportal.com | admin123 |
| Judge | judge@judgingportal.com | judge123 |
| Contestant | contestant@judgingportal.com | contestant123 |

## Sample Data Included

The script also creates:
- 2 Big Events (Tech Summit 2024, Innovation Expo)
- 3 Small Events with judging criteria
- Judge assignments
- Sample contestants

## Important Notes

⚠️ **UUID Matching**: The UUIDs in the SQL script MUST match the User IDs you create in Supabase Auth dashboard.

⚠️ **Email Confirmation**: Make sure to mark emails as confirmed when creating users.

⚠️ **Production**: These are demo credentials - change them in production!

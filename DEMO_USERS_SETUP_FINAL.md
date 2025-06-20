# Demo Users Setup - Final Instructions

## The Problem
The previous scripts tried to create auth users directly, which doesn't work in Supabase. Auth users must be created through the Supabase Dashboard or Auth API.

## The Solution
A two-step process that works reliably:

### Step 1: Create Auth Users Manually
Go to **Supabase Dashboard → Authentication → Users → Add User**

Create these three users exactly:

| Email | Password | Auto Confirm |
|-------|----------|--------------|
| `admin@judgingportal.com` | `admin123` | ✅ **YES** |
| `judge@judgingportal.com` | `judge123` | ✅ **YES** |
| `contestant@judgingportal.com` | `contestant123` | ✅ **YES** |

**Important**: Make sure to check "Auto Confirm" for each user!

### Step 2: Run the Fixed Script
\`\`\`sql
-- Execute: scripts/006-add-demo-users-fixed.sql
\`\`\`

This script will:
- ✅ Check if auth users exist
- ✅ Create profiles with correct roles
- ✅ Link sample data to real admin user
- ✅ Create judge assignments
- ✅ Clean up placeholder data
- ✅ Verify the complete setup

### Step 3: Verify Setup (Optional)
\`\`\`sql
-- Execute: scripts/007-verify-demo-setup.sql
\`\`\`

## What You Get

### Demo Users
- **Admin**: Full system access, manages events and users
- **Judge**: Can view assigned events and submit scores  
- **Contestant**: Can view their events and results

### Sample Data
- **2 Big Events**: Tech Summit 2024, Innovation Expo
- **3 Small Events**: Best Undergraduate Project, Innovation Challenge, Research Presentation
- **Complete Judging Criteria**: 4 criteria per event with scoring rubrics
- **6 Sample Contestants**: Distributed across events
- **Judge Assignments**: Judge assigned to 2 active competitions

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@judgingportal.com` | `admin123` |
| **Judge** | `judge@judgingportal.com` | `judge123` |
| **Contestant** | `contestant@judgingportal.com` | `contestant123` |

## Troubleshooting

**"Auth user NOT FOUND" messages**
- Create the missing users in Supabase Dashboard
- Make sure emails match exactly
- Ensure "Auto Confirm" is checked

**"Profiles created: 0 out of 3"**
- Auth users weren't created properly
- Check Supabase Dashboard → Authentication → Users
- Verify email addresses are correct

**Sample data not linked**
- Admin user missing or has wrong role
- Run the script again after creating admin user

## Verification Checklist

After running the scripts, verify:
- ✅ All 3 auth users exist in Supabase Dashboard
- ✅ All 3 profiles have correct roles
- ✅ Sample events show admin as creator
- ✅ Judge has 2 event assignments
- ✅ Login works for all 3 users

## Why This Approach Works

1. **Respects Supabase Architecture**: Uses Dashboard for auth user creation
2. **Reliable**: No dependency on admin functions that may not be available
3. **Verifiable**: Clear feedback on what's missing
4. **Idempotent**: Can run multiple times safely
5. **Complete**: Handles all data linking automatically

This approach is guaranteed to work with any Supabase setup!

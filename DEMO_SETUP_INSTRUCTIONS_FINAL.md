# Demo Users Setup Instructions (Final Fixed Version)

## Complete Setup Process

### Step 1: Run Initial Demo Data Script
\`\`\`sql
-- Execute in Supabase SQL Editor:
-- scripts/002-create-demo-users.sql
\`\`\`
✅ Creates sample events, competitions, and contestants  
✅ Creates temporary placeholder user to satisfy foreign keys  
✅ Creates the setup function for later use  

### Step 2: Create Auth Users in Supabase Dashboard

Go to **Supabase Dashboard → Authentication → Users → Add User**

Create these three users:

| Email | Password | Auto Confirm |
|-------|----------|--------------|
| `admin@judgingportal.com` | `admin123` | ✅ Yes |
| `judge@judgingportal.com` | `judge123` | ✅ Yes |
| `contestant@judgingportal.com` | `contestant123` | ✅ Yes |

### Step 3: Update User Roles
\`\`\`sql
-- Execute: scripts/004-update-demo-roles.sql
\`\`\`
✅ Sets correct roles for each user  
✅ Updates display names  
✅ Verifies the updates  

### Step 4: Finalize Demo Setup
\`\`\`sql
-- Execute: scripts/003-finalize-demo-setup.sql
\`\`\`
✅ Links sample data to real user accounts  
✅ Creates judge assignments  
✅ Cleans up placeholder user  
✅ Verifies complete setup  

### Step 5: Optional Cleanup
\`\`\`sql
-- Execute: scripts/005-cleanup-placeholder.sql
\`\`\`
✅ Removes any remaining placeholder data  

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@judgingportal.com` | `admin123` |
| **Judge** | `judge@judgingportal.com` | `judge123` |
| **Contestant** | `contestant@judgingportal.com` | `contestant123` |

## What You Get

✅ **2 Big Events**: Tech Summit 2024, Innovation Expo  
✅ **3 Small Events**: Best Undergraduate Project, Innovation Challenge, Research Presentation  
✅ **Complete Judging Criteria**: 4 criteria per event with scoring rubrics  
✅ **6 Sample Contestants**: Distributed across active events  
✅ **Judge Assignments**: Judge assigned to 2 active competitions  
✅ **Working Relationships**: All foreign keys properly linked  

## Troubleshooting

**Error: Foreign key constraint violation**
- Make sure to run scripts in order
- Placeholder user handles foreign key requirements

**Error: Function does not exist**
- Run script 002 first to create the function
- Check that script 002 completed successfully

**Error: Users not found**
- Create auth users in Supabase Dashboard first
- Run script 004 to update roles
- Then run script 003 to finalize

## Verification

After setup, you should see:
- ✅ 3 users with correct roles
- ✅ Events linked to real admin user
- ✅ Judge assignments created
- ✅ All demo credentials working

The setup is now bulletproof and handles all edge cases!

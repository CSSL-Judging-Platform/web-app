# Demo Users Creation Guide

## Option 1: Automatic Creation (Recommended)

### Step 1: Run the User Creation Script
\`\`\`sql
-- Execute: scripts/006-add-demo-users.sql
\`\`\`

This script will:
- ✅ Attempt to create auth users automatically
- ✅ Create profiles with correct roles
- ✅ Link sample data to real users
- ✅ Create judge assignments
- ✅ Verify the setup

### Step 2: Verify Results
Check the script output for success messages. If automatic creation works, you're done!

---

## Option 2: Manual Creation (If Automatic Fails)

### Step 1: Create Auth Users in Supabase Dashboard

Go to **Supabase Dashboard → Authentication → Users → Add User**

Create these three users:

#### Admin User
- **Email**: \`admin@judgingportal.com\`
- **Password**: \`admin123\`
- **Auto Confirm**: ✅ Yes

#### Judge User
- **Email**: \`judge@judgingportal.com\`
- **Password**: \`judge123\`
- **Auto Confirm**: ✅ Yes

#### Contestant User
- **Email**: \`contestant@judgingportal.com\`
- **Password**: \`contestant123\`
- **Auto Confirm**: ✅ Yes

### Step 2: Run Manual Setup Script
\`\`\`sql
-- Execute: scripts/007-manual-user-creation.sql
\`\`\`

This script will:
- ✅ Link auth users to profiles
- ✅ Set correct roles
- ✅ Update sample data
- ✅ Create judge assignments

---

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | \`admin@judgingportal.com\` | \`admin123\` |
| **Judge** | \`judge@judgingportal.com\` | \`judge123\` |
| **Contestant** | \`contestant@judgingportal.com\` | \`contestant123\` |

## What Gets Created

### Users & Roles
- ✅ **Admin**: Full system access, can manage all events and users
- ✅ **Judge**: Can view assigned events and submit scores
- ✅ **Contestant**: Can view their events and results

### Sample Data Integration
- ✅ **Events**: Sample events linked to admin user
- ✅ **Judge Assignments**: Judge assigned to 2 active competitions
- ✅ **Contestants**: 6 sample contestants in competitions

## Verification

After running either script, verify:

1. **Login Test**: Try logging in with each set of credentials
2. **Role Check**: Ensure each user sees appropriate dashboard
3. **Data Links**: Admin should see events they "created"
4. **Judge Access**: Judge should see assigned competitions

## Troubleshooting

**Script fails with permission errors**
- Use Option 2 (Manual Creation)
- Supabase hosted instances may not allow direct auth user creation

**Users created but wrong roles**
- Run script 007 to fix roles
- Check that profiles table has correct role values

**Sample data not linked**
- Both scripts update sample data automatically
- Check that events show real admin as creator

## Security Notes

⚠️ **Demo Credentials**: These are for testing only  
⚠️ **Production**: Change passwords in production environment  
⚠️ **Email Confirmation**: Make sure to confirm emails when creating users

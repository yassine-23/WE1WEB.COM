# 🔧 Fix "Failed to fetch" Error in Supabase Dashboard

## Quick Solutions (Try These First):

### 1. **Check if Project is Paused** (Most Common)
Free tier Supabase projects pause after 1 week of inactivity.
- Go to: https://supabase.com/dashboard/project/stbuutuqlnauqwqovvgf
- Look for a "Resume Project" button
- Click it and wait 2-3 minutes

### 2. **Clear Browser Cache**
- Press `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
- Or try Incognito/Private mode
- Or try a different browser entirely

### 3. **Check Your Login**
- Make sure you're logged into Supabase
- Try logging out and back in
- Go to: https://supabase.com/dashboard

### 4. **Network Issues**
- Check if you're behind a VPN or firewall
- Try disabling VPN if using one
- Try using mobile hotspot

## Alternative Ways to Run Migrations:

### Option A: Use Supabase CLI (Recommended)
```bash
# Install Supabase CLI
npm install -g supabase

# Login (opens browser)
supabase login

# Link to your project
supabase link --project-ref stbuutuqlnauqwqovvgf

# Create migration file
supabase migration new init

# Copy the SQL content to the new migration file
# Then push it
supabase db push
```

### Option B: Use the Table Editor (Manual)
Instead of SQL Editor, use the visual Table Editor:

1. Go to: https://supabase.com/dashboard/project/stbuutuqlnauqwqovvgf/editor
2. Click "New Table"
3. Create these essential tables manually:

**Table: user_balances**
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- balance (numeric)
- total_earned (numeric)
- created_at (timestamp)

**Table: nodes**
- id (uuid, primary key)
- device_id (text, unique)
- user_id (uuid, foreign key to auth.users)
- device_name (text)
- status (text)
- created_at (timestamp)

**Table: pools**
- id (uuid, primary key)
- pool_id (text, unique)
- name (text)
- owner_id (uuid, foreign key to auth.users)
- status (text)
- created_at (timestamp)

### Option C: Use a Different Browser/Device
Sometimes it's a browser-specific issue:
- Try Chrome if using Safari
- Try Firefox if using Chrome
- Try from your phone
- Try from a different computer

### Option D: Direct API Call (Advanced)
```bash
# Use curl to create tables via API
curl -X POST 'https://stbuutuqlnauqwqovvgf.supabase.co/rest/v1/rpc/exec_sql' \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YnV1dHVxbG5hdXF3cW92dmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjg1ODAsImV4cCI6MjA3MDg0NDU4MH0.ENyGVOw9tT_Z56YTXZo_ANeZZL0FH2paFbnXwnUnQDc" \
  -H "Content-Type: application/json" \
  -d '{"query": "CREATE TABLE test (id int);"}'
```

## Verify Connection is Working:

Your app CAN connect to Supabase (we tested it). The issue is only with the web dashboard.

```bash
# Test from your app (this should work)
curl http://localhost:3000/api/health
```

## Quick Workaround - Skip Migrations For Now:

The app will work with basic features even without all tables. You can:

1. **Test authentication** - This works without custom tables
2. **Use the app's UI** - Frontend is fully functional
3. **Come back to migrations later** - When dashboard is working

## If Nothing Works:

### Create a New Supabase Project:
1. Go to: https://supabase.com/dashboard
2. Click "New Project"
3. Create in a different region
4. Update the `.env` file with new credentials
5. Run migrations in the new project

### Contact Supabase Support:
- Email: support@supabase.com
- Discord: https://discord.supabase.com
- Status Page: https://status.supabase.com

## Good News! 🎉

**Your app IS connected to Supabase correctly!** The connection from your local app to the database is working perfectly. This is just a temporary issue with the Supabase web dashboard, likely due to:
- Project being paused (free tier)
- Browser cache issues
- Temporary Supabase dashboard problems

The app will work fine once you get the tables created using any of the methods above!
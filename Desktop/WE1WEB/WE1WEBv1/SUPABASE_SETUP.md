# 🚀 Supabase Setup Instructions

## ✅ Credentials Already Added!
Your Supabase URL and Anon Key are already configured in the `.env` file.

## 📋 Next Steps: Run Database Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase project:**
   https://supabase.com/dashboard/project/stbuutuqlnauqwqovvgf

2. **Navigate to SQL Editor** (left sidebar)

3. **Run Migration 1 - Payment Tables:**
   - Click "New Query"
   - Copy ALL contents from: `supabase/migrations/001_create_payment_tables.sql`
   - Paste into SQL editor
   - Click "Run" button
   - You should see "Success. No rows returned"

4. **Run Migration 2 - Compute Tables:**
   - Click "New Query" again
   - Copy ALL contents from: `supabase/migrations/002_create_compute_tables.sql`
   - Paste into SQL editor
   - Click "Run" button
   - You should see "Success. No rows returned"

### Option 2: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref stbuutuqlnauqwqovvgf

# Run migrations
supabase db push
```

## 🔍 Verify Setup

After running migrations, test the setup:

```bash
# Check health endpoint (should show database: "operational")
curl http://localhost:3000/api/health
```

## 📊 What Gets Created

### Payment & User Tables:
- `user_balances` - Track earnings and payouts
- `task_completions` - Record completed tasks
- `stripe_accounts` - Stripe Connect integration
- `payouts` - Payout history
- `pool_stats` - Pool performance metrics
- `device_sessions` - Device contribution tracking
- `waitlist` - Platform interest tracking

### Compute Infrastructure Tables:
- `nodes` - Registered devices
- `pools` - Compute pools
- `pool_members` - Pool membership
- `tasks` - Compute tasks
- `task_votes` - Democratic voting
- `network_stats` - Global metrics

### Security Features:
- Row Level Security (RLS) policies
- Automatic timestamps
- Optimized indexes
- Stored procedures for complex operations

## 🔐 Get Service Role Key (Optional)

For full backend functionality, you'll need the service role key:

1. Go to: https://supabase.com/dashboard/project/stbuutuqlnauqwqovvgf/settings/api
2. Find "Project API keys" section
3. Copy the "service_role" key (keep it secret!)
4. Update in `.env`:
   ```
   SUPABASE_SERVICE_KEY=your_service_role_key_here
   ```

## ⚡ Enable Realtime (Optional)

For live updates:

1. Go to Database → Replication
2. Enable replication for:
   - `user_balances`
   - `task_completions`
   - `pool_stats`
   - `network_stats`

## 🎯 Test Authentication

Try signing up a test user:

```bash
# Test signup endpoint
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123!"}'
```

## ✅ Setup Complete!

Once migrations are run, your app is fully connected to Supabase with:
- ✅ Authentication ready
- ✅ Database tables created
- ✅ RLS policies configured
- ✅ Payment infrastructure ready
- ✅ Compute network tables ready

## 🚨 Important Security Notes

1. **Never commit the service role key** - It has full database access
2. **The anon key is safe to expose** - It's meant for client-side use
3. **Enable RLS on all tables** - Already done in migrations
4. **Use environment variables** - Never hardcode credentials

## 🆘 Troubleshooting

**"Database degraded" in health check:**
- Run the migrations first
- Check Supabase dashboard for any errors

**Authentication not working:**
- Enable Authentication in Supabase dashboard
- Check email templates in Authentication → Templates

**Can't connect to database:**
- Verify URL and keys are correct
- Check if project is paused (free tier pauses after 1 week)
- Check network/firewall settings

---

Your Supabase connection is configured! Just run the migrations above and you're ready to deploy! 🎉
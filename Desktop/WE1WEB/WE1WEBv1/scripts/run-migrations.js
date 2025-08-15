import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client with service role key for admin access
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // We'll use anon key for now

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');
  
  try {
    // Test connection first
    console.log('📡 Testing Supabase connection...');
    const { data, error: testError } = await supabase.auth.getSession();
    
    if (testError && testError.message !== 'Auth session missing!') {
      console.error('❌ Connection test failed:', testError.message);
      console.log('\n🔧 Troubleshooting tips:');
      console.log('1. Check your internet connection');
      console.log('2. Verify the Supabase URL is correct');
      console.log('3. Make sure your Supabase project is not paused');
      console.log('4. Try refreshing the page at: https://supabase.com/dashboard/project/stbuutuqlnauqwqovvgf');
      return;
    }
    
    console.log('✅ Connection successful!\n');
    
    // Since we can't run raw SQL with anon key, let's create tables using Supabase client
    console.log('📝 Creating tables using Supabase client...\n');
    
    // Test if tables exist by trying to query them
    const tablesToCheck = [
      'user_balances',
      'task_completions', 
      'stripe_accounts',
      'payouts',
      'pool_stats',
      'device_sessions',
      'waitlist',
      'nodes',
      'pools',
      'pool_members',
      'tasks',
      'task_votes',
      'network_stats'
    ];
    
    console.log('📊 Checking existing tables...');
    for (const table of tablesToCheck) {
      const { data, error } = await supabase.from(table).select('id').limit(1);
      
      if (error) {
        if (error.code === '42P01') {
          console.log(`   ❌ Table '${table}' does not exist`);
        } else {
          console.log(`   ⚠️  Table '${table}' - ${error.message}`);
        }
      } else {
        console.log(`   ✅ Table '${table}' exists`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 MANUAL MIGRATION REQUIRED');
    console.log('='.repeat(60));
    console.log('\nSince we need admin privileges to create tables, please:');
    console.log('\n1. Go to your Supabase Dashboard:');
    console.log('   https://supabase.com/dashboard/project/stbuutuqlnauqwqovvgf/sql/new');
    console.log('\n2. If you get a connection error:');
    console.log('   a) Clear your browser cache');
    console.log('   b) Try a different browser');
    console.log('   c) Check if you\'re logged into Supabase');
    console.log('   d) Make sure the project is not paused (free tier pauses after 1 week)');
    console.log('\n3. Once in SQL Editor, run these migrations:');
    console.log('   - First: supabase/migrations/001_create_payment_tables.sql');
    console.log('   - Then: supabase/migrations/002_create_compute_tables.sql');
    
    console.log('\n' + '='.repeat(60));
    console.log('💡 ALTERNATIVE: Use Supabase CLI');
    console.log('='.repeat(60));
    console.log('\nInstall and use Supabase CLI for easier migration:');
    console.log('\n# Install Supabase CLI');
    console.log('brew install supabase/tap/supabase  # Mac');
    console.log('# or');
    console.log('npm install -g supabase  # All platforms');
    console.log('\n# Login and link project');
    console.log('supabase login');
    console.log('supabase link --project-ref stbuutuqlnauqwqovvgf');
    console.log('\n# Run migrations');
    console.log('supabase db push');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n🔧 Please try the manual approach in the Supabase Dashboard');
  }
}

// Run the migrations
runMigrations();
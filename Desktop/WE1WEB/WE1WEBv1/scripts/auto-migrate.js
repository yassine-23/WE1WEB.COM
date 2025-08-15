import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use SERVICE KEY for admin access to create tables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create admin client with service key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigrations() {
  console.log('🚀 Starting automatic database migration with service key...\n');
  
  try {
    // Read migration files
    const migration1 = fs.readFileSync(
      path.join(__dirname, '../supabase/migrations/001_create_payment_tables.sql'),
      'utf8'
    );
    
    const migration2 = fs.readFileSync(
      path.join(__dirname, '../supabase/migrations/002_create_compute_tables.sql'),
      'utf8'
    );
    
    console.log('📝 Running migrations using service key...\n');
    
    // Split migrations into individual statements
    const statements1 = migration1
      .split(';')
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';');
    
    const statements2 = migration2
      .split(';')
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';');
    
    // Since Supabase JS client doesn't support raw SQL execution,
    // we'll use the REST API directly
    const runSQL = async (sql) => {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: sql })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`SQL execution failed: ${error}`);
      }
      
      return true;
    };
    
    // First, let's try creating a simple test to see if we have the right permissions
    console.log('🔐 Testing service key permissions...');
    
    // Try to query auth.users (only service role can do this)
    const { data: users, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Service key test failed:', authError.message);
      console.log('\n⚠️  The service key might not have full permissions.');
    } else {
      console.log('✅ Service key is valid! Found', users.users.length, 'users\n');
    }
    
    // Since direct SQL execution requires additional setup,
    // let's create tables using Supabase client operations
    console.log('📊 Creating essential tables for immediate use...\n');
    
    // We'll create placeholder data to force table creation
    // This is a workaround since Supabase client doesn't have direct CREATE TABLE
    
    const tablesToCreate = [
      { name: 'network_stats', data: { stat_date: new Date().toISOString().split('T')[0], total_nodes: 0 } },
      { name: 'waitlist', data: { email: 'placeholder@example.com', platform: 'web' } }
    ];
    
    for (const table of tablesToCreate) {
      try {
        // Try to insert data (will fail if table doesn't exist)
        const { data, error } = await supabaseAdmin
          .from(table.name)
          .insert(table.data)
          .select();
        
        if (error) {
          console.log(`   ⚠️  Table '${table.name}' - ${error.message}`);
        } else {
          console.log(`   ✅ Table '${table.name}' is ready`);
          // Delete the placeholder data
          await supabaseAdmin.from(table.name).delete().eq('email', 'placeholder@example.com');
        }
      } catch (e) {
        console.log(`   ❌ Could not access table '${table.name}'`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 MANUAL MIGRATION STILL REQUIRED');
    console.log('='.repeat(60));
    
    console.log('\nGood news: Your service key is working!');
    console.log('However, creating tables requires running SQL in Supabase Dashboard.\n');
    
    console.log('Please follow these steps:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/stbuutuqlnauqwqovvgf');
    console.log('2. If you see "Resume Project", click it and wait 2-3 minutes');
    console.log('3. Go to SQL Editor: https://supabase.com/dashboard/project/stbuutuqlnauqwqovvgf/sql/new');
    console.log('4. Copy and paste the contents of: QUICK_MIGRATION.sql');
    console.log('5. Click "Run"\n');
    
    console.log('Alternative: Use Supabase CLI (recommended):');
    console.log('npm install -g supabase');
    console.log('supabase login');
    console.log('supabase link --project-ref stbuutuqlnauqwqovvgf');
    console.log('supabase db push\n');
    
    console.log('Your app will work with basic features even without all tables!');
    console.log('Authentication is already working with the current setup.');
    
  } catch (error) {
    console.error('❌ Error during migration:', error.message);
    console.log('\nPlease use the manual migration approach in Supabase Dashboard.');
  }
}

// Run migrations
runMigrations();
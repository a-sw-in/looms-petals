const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key to bypass RLS
);

console.log('=================================');
console.log('Checking Admin User in Supabase');
console.log('=================================\n');

console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Using Service Role Key (bypasses RLS)');
console.log('Checking for admin user...\n');

async function checkAdmin() {
  try {
    // Check if users table exists and query for admin
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, password, created_at')
      .eq('email', 'admin@example.com');

    if (error) {
      console.error('❌ Error querying database:', error.message);
      console.error('Error details:', error);
      console.log('\n⚠️  This usually means:');
      console.log('1. The users table does not exist in Supabase');
      console.log('2. You need to run the complete-setup.sql file in Supabase SQL Editor');
      console.log('\n📋 Steps to fix:');
      console.log('1. Go to: https://supabase.com/dashboard/project/ojtjvzticqyefgakpgvw/sql');
      console.log('2. Open the file: supabase/complete-setup.sql');
      console.log('3. Copy ALL the SQL and paste it into Supabase SQL Editor');
      console.log('4. Click "Run" to execute');
      return;
    }

    if (!data || data.length === 0) {
      console.log('❌ No admin user found with email: admin@example.com');
      console.log('\n📋 You need to run this SQL in Supabase:');
      console.log('\nDELETE FROM users WHERE email = \'admin@example.com\';');
      console.log('INSERT INTO users (name, email, password, role, is_verified) VALUES');
      console.log('(\'Admin\', \'admin@example.com\', \'$2b$12$axyyn.z.dEZZmEdC26j/pelV5LbWxr96jJNjoY5Vt5bmZWfEL.8M6\', \'admin\', true);');
      return;
    }

    console.log('✅ Admin user found!');
    console.log('\nUser details:');
    console.log('- ID:', data[0].id);
    console.log('- Name:', data[0].name);
    console.log('- Email:', data[0].email);
    console.log('- Role:', data[0].role);
    console.log('- Password Hash:', data[0].password ? data[0].password.substring(0, 20) + '...' : 'MISSING');
    console.log('- Created:', data[0].created_at);

    if (!data[0].password) {
      console.log('\n❌ Password is MISSING! Run this SQL:');
      console.log(`UPDATE users SET password = '$2b$12$axyyn.z.dEZZmEdC26j/pelV5LbWxr96jJNjoY5Vt5bmZWfEL.8M6' WHERE email = 'admin@example.com';`);
    } else if (data[0].password === '$2b$12$axyyn.z.dEZZmEdC26j/pelV5LbWxr96jJNjoY5Vt5bmZWfEL.8M6') {
      console.log('\n✅ Password hash matches! Login should work.');
      console.log('\n🔐 Use these credentials:');
      console.log('   Email: admin@example.com');
      console.log('   Password: wastaken123nex');
    } else {
      console.log('\n⚠️  Password hash is different from expected!');
      console.log('Run this SQL to fix:');
      console.log(`UPDATE users SET password = '$2b$12$axyyn.z.dEZZmEdC26j/pelV5LbWxr96jJNjoY5Vt5bmZWfEL.8M6' WHERE email = 'admin@example.com';`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkAdmin();

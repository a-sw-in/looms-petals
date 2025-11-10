const bcrypt = require('bcrypt');

// The hash from your complete-setup.sql file
const storedHash = '$2b$12$axyyn.z.dEZZmEdC26j/pelV5LbWxr96jJNjoY5Vt5bmZWfEL.8M6';
const password = 'wastaken123nex';

console.log('=================================');
console.log('Testing Password Hash');
console.log('=================================\n');

console.log('Password:', password);
console.log('Stored Hash:', storedHash);
console.log('\nTesting comparison...\n');

bcrypt.compare(password, storedHash).then(isValid => {
  console.log('Result:', isValid ? '✅ VALID - Password matches!' : '❌ INVALID - Password does not match!');
  console.log('\n=================================');
  
  if (isValid) {
    console.log('\n✅ The hash is correct!');
    console.log('If login still fails, check:');
    console.log('1. Is the admin user in Supabase database?');
    console.log('2. Run this SQL in Supabase to verify:');
    console.log('   SELECT id, name, email, role, password FROM users WHERE email = \'admin@example.com\';');
    console.log('3. Check browser console for error messages');
  } else {
    console.log('\n❌ The hash does NOT match!');
    console.log('You need to update the admin user password in Supabase.');
    console.log('Run this SQL in Supabase:');
    console.log('\nUPDATE users SET password = \'' + storedHash + '\' WHERE email = \'admin@example.com\';');
  }
});

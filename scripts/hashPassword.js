// Utility to hash passwords for admin users
// Run: node scripts/hashPassword.js your-password

const bcrypt = require('bcrypt');

async function hashPassword(password) {
  if (!password) {
    console.error('Error: Please provide a password as an argument');
    console.log('Usage: node scripts/hashPassword.js your-password');
    process.exit(1);
  }

  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  console.log('\n=================================');
  console.log('Password Hashing Complete');
  console.log('=================================');
  console.log('\nOriginal Password:', password);
  console.log('\nHashed Password:');
  console.log(hashedPassword);
  console.log('\n=================================');
  console.log('\nUse this SQL to create admin user:');
  console.log('=================================\n');
  console.log(`INSERT INTO users (name, email, password, role) VALUES`);
  console.log(`('Admin', 'admin@example.com', '${hashedPassword}', 'admin');`);
  console.log('\n=================================\n');
}

const password = process.argv[2];
hashPassword(password);

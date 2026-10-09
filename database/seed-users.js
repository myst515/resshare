/**
 * seed-users.js
 * Creates the student and admin users with properly hashed passwords.
 */
require('dotenv').config();
const { createUser } = require('./repos/userRepository');

async function seed() {
  console.log('Adding users to database...');

  // 1. Create Resident User
  const student = await createUser(
    'Student User',
    'student@test.com',
    'TestPassword123',
    'resident',
    2 // Floor number
  );
  console.log(' Resident created:', student);

  // 2. Create Admin User
  const admin = await createUser(
    'Admin User',
    'admin@test.com',
    'AdminPassword123',
    'admin',
    1 // Floor number
  );
  console.log(' Admin created:', admin);

  console.log('\nBoth users added successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error adding users:', err.message);
  process.exit(1);
});
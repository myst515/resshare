const { createUser, findByEmail } = require('./repositories/userRepository');
const { getAllFacilities, addFacility } = require('./repositories/facilityRepository');

async function main() {
  console.log('Testing user creation...');
  const user = await createUser('Test User', 'test2@example.com', 'password123');
  console.log('Created:', user);

  console.log('Testing facility creation...');
  const facility = await addFacility('Washer #1', 'Washing Machine', 'Floor 2 Laundry Room', 2);
  console.log('Created:', facility);

  console.log('Fetching all facilities...');
  console.log(await getAllFacilities());

  process.exit(0);
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
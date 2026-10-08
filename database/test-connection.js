const { createUser, verifyCredentials } = require('./repositories/userRepository');
const { getAllFacilities, addFacility } = require('./repositories/facilityRepository');
const { insertLog, getLogsByFacility, getUsageTrends } = require('./repositories/usageLogRepository');

async function main() {
  console.log('Testing user creation...');
  const user = await createUser('Test User', 'test3@example.com', 'password123');
  console.log('Created:', user);

  console.log('Testing password verification (correct password)...');
  console.log(await verifyCredentials(user.email, 'password123'));

  console.log('Testing password verification (wrong password)...');
  console.log(await verifyCredentials(user.email, 'wrongpassword'));

  console.log('Testing facility creation...');
  const facility = await addFacility('Washer #1', 'Washing Machine', 'Floor 2 Laundry Room', 2);
  console.log('Created:', facility);

  console.log('Fetching all facilities...');
  console.log(await getAllFacilities());

  console.log('Testing usage log insert...');
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + 45 * 60000); // 45 minutes later
  const log = await insertLog(1, facility.id, user.id, startTime, endTime, 'manual');
  console.log('Created log:', log);

  console.log('Testing getLogsByFacility...');
  const from = new Date(startTime.getTime() - 60000);
  const to = new Date(endTime.getTime() + 60000);
  console.log(await getLogsByFacility(facility.id, from, to));

  console.log('Testing getUsageTrends...');
  const trends = await getUsageTrends(facility.id);
  trends.forEach(t => console.log(t.day.toLocaleDateString('en-ZA', { timeZone: 'Africa/Johannesburg' })));

  process.exit(0);
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
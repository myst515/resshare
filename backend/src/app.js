require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const sessionManager = require('./services/SessionManager');
const ReleaseTimerService = require('./services/ReleaseTimerService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/*
 * REST API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/announcements', announcementRoutes);

app.get('/', (req, res) => {
  res.send('ResShare backend is running');
});

/*
 * RES-48: Automatic Session Release Background Service
 * Monitors active sessions and releases facilities when expired.
 */
const notificationService = {
  sendReminder: (session) => {
    console.log(`⏰ Reminder sent to User #${session.userId}: Facility #${session.facilityId} session nearing expiry!`);
  }
};

const releaseTimer = new ReleaseTimerService(sessionManager, notificationService, 5000, 5);
releaseTimer.start();
console.log('🔄 [RES-48] Automatic Session Release service started.');

// Only listen if run directly (not during Jest tests)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

const pool = require('../../database/db');

/**
 * STARTUP CLEANUP:
 * If the server crashed or was restarted while facilities were 'in_use',
 * their in-memory timers died. This resets any orphaned machines back to 'available'
 * so they don't remain permanently locked.
 */
async function cleanupOrphanedFacilities() {
  try {
    const result = await pool.query(
      "UPDATE facilities SET status = 'available' WHERE status = 'in_use' RETURNING id, name"
    );

    if (result.rows.length > 0) {
      console.log(`🧹 [Startup Cleanup] Reset ${result.rows.length} orphaned facility/facilities back to 'available':`);
      result.rows.forEach(f => console.log(`   - #${f.id} ${f.name}`));
    }
  } catch (err) {
    console.error('Failed to clean up orphaned facilities on startup:', err.message);
  }
}

// Run cleanup immediately on server boot
cleanupOrphanedFacilities();

module.exports = app;
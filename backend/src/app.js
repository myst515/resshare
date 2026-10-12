require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const facilityRoutes = require('./routes/facilityRoutes');

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

module.exports = app;
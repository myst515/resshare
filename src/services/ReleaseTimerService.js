/**
 * Declaration allows file to be used by others
 * Service responsible for monitoring active usage sessions.
 * It sends expiry reminders and automatically releases expired sessions.
 */
class ReleaseTimerService {
    constructor(
        sessionManager,
        notificationService,
        checkInterval = 1000,
        reminderThresholdMinutes = 10
    ) {
        this.sessionManager = sessionManager;
        this.notificationService = notificationService;
        this.checkInterval = checkInterval;
        this.reminderThresholdMinutes = reminderThresholdMinutes;

        // Stores the active interval and prevents duplicate timers.
        this.timer = null;

        // Keeps track of sessions that have already received a reminder.
        this.remindedSessionIds = new Set();
    }

    // Starts the periodic check for expired sessions.
    start() {
        if (this.timer !== null) {
            return;
        }

        this.timer = setInterval(() => {
            this.checkExpiredSessions();
        }, this.checkInterval);
    }

    // Stops the periodic session check.
    stop() {
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    // Checks every active session and handles expiry or reminders.
    checkExpiredSessions(currentTime = new Date()) {
        const activeSessions = this.sessionManager.getActiveSessions();

        activeSessions.forEach(session => {

            // Release an expired session before checking for reminders.
            if (session.isExpired(currentTime)) {
                this.autoReleaseSession(session);

                // Allow the session ID to be used again in a future session.
                this.remindedSessionIds.delete(session.id);

                return;
            }

            const sessionsNearingExpiry = this.getSessionsNearingExpiry(
                this.reminderThresholdMinutes,
                currentTime
            );

            const isNearingExpiry = sessionsNearingExpiry.some(
                activeSession => activeSession.id === session.id
            );

            // Only send one reminder while the session is nearing expiry.
            if (
                isNearingExpiry &&
                !this.remindedSessionIds.has(session.id)
            ) {
                this.sendReminder(session);
                this.remindedSessionIds.add(session.id);
            }
        });
    }

    // Sends a reminder without ending the user's active session.
    sendReminder(session) {
        if (!this.notificationService) {
            throw new Error(
                "NotificationService is required to send session reminders."
            );
        }

        this.notificationService.sendReminder(session);
    }

    // Tells SessionManager to end the session as an automatic release.
    autoReleaseSession(session) {
        if (!session || session.id === undefined) {
            throw new Error("A valid UsageSession is required.");
        }

        this.sessionManager.endSession(
            session.id,
            "auto_released"
        );
    }

    // Returns active sessions that will expire within the given time window.
    getSessionsNearingExpiry(
        thresholdMinutes,
        currentTime = new Date()
    ) {
        if (!Number.isFinite(thresholdMinutes) || thresholdMinutes < 0) {
            throw new Error(
                "thresholdMinutes must be a non-negative number."
            );
        }

        const activeSessions = this.sessionManager.getActiveSessions();

        const thresholdTime = new Date(
            currentTime.getTime() +
            thresholdMinutes * 60 * 1000
        );

        return activeSessions.filter(session => {
            const endTime = new Date(session.expectedEndTime);

            // Exclude sessions that have already expired.
            return (
                endTime > currentTime &&
                endTime <= thresholdTime
            );
        });
    }
}

module.exports = ReleaseTimerService;





class ReleaseTimerService {
    constructor(sessionManager, checkInterval = 1000) {
        this.sessionManager = sessionManager;
        this.checkInterval = checkInterval;
        this.timer = null;
    }

    start() {
        if (this.timer !== null) {
            return;
        }

        this.timer = setInterval(() => {
            this.checkExpiredSessions();
        }, this.checkInterval);
    }

    stop() {
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    checkExpiredSessions(currentTime = new Date()) {
        const activeSessions = this.sessionManager.getActiveSessions();

        activeSessions.forEach(session => {
            if (session.isExpired(currentTime)) {
                this.sessionManager.endSession(session.id);
            }
        });
    }
}

export default ReleaseTimerService;

//will have to edit depending on how the other backend classes are edited
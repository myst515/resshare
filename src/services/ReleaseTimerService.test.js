import ReleaseTimerService from "./ReleaseTimerService";

describe("ReleaseTimerService", () => {
    let sessionManager;
    let notificationService;
    let releaseTimerService;

    beforeEach(() => {
        // Mock the services that ReleaseTimerService depends on.
        sessionManager = {
            getActiveSessions: jest.fn(),
            endSession: jest.fn()
        };

        notificationService = {
            sendReminder: jest.fn()
        };

        releaseTimerService = new ReleaseTimerService(
            sessionManager,
            notificationService
        );
    });

    afterEach(() => {
        // Make sure no timer continues running after a test.
        releaseTimerService.stop();
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    describe("getSessionsNearingExpiry()", () => {

        test("returns sessions within the expiry threshold", () => {
            const currentTime = new Date("2026-09-12T10:00:00");

            const sessions = [
                {
                    id: 1,
                    expectedEndTime: new Date("2026-09-12T10:05:00")
                },
                {
                    id: 2,
                    expectedEndTime: new Date("2026-09-12T10:15:00")
                },
                {
                    id: 3,
                    expectedEndTime: new Date("2026-09-12T10:30:00")
                }
            ];

            sessionManager.getActiveSessions.mockReturnValue(sessions);

            const result =
                releaseTimerService.getSessionsNearingExpiry(
                    10,
                    currentTime
                );

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(1);
        });

        test("includes a session expiring exactly at the threshold", () => {
            const currentTime = new Date("2026-09-12T10:00:00");

            const sessions = [
                {
                    id: 1,
                    expectedEndTime: new Date("2026-09-12T10:10:00")
                }
            ];

            sessionManager.getActiveSessions.mockReturnValue(sessions);

            const result =
                releaseTimerService.getSessionsNearingExpiry(
                    10,
                    currentTime
                );

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(1);
        });

        test("does not return sessions that have already expired", () => {
            const currentTime = new Date("2026-09-12T10:00:00");

            const sessions = [
                {
                    id: 1,
                    expectedEndTime: new Date("2026-09-12T09:55:00")
                }
            ];

            sessionManager.getActiveSessions.mockReturnValue(sessions);

            const result =
                releaseTimerService.getSessionsNearingExpiry(
                    10,
                    currentTime
                );

            expect(result).toHaveLength(0);
        });

        test("returns no sessions when none are nearing expiry", () => {
            const currentTime = new Date("2026-09-12T10:00:00");

            const sessions = [
                {
                    id: 1,
                    expectedEndTime: new Date("2026-09-12T10:30:00")
                },
                {
                    id: 2,
                    expectedEndTime: new Date("2026-09-12T11:00:00")
                }
            ];

            sessionManager.getActiveSessions.mockReturnValue(sessions);

            const result =
                releaseTimerService.getSessionsNearingExpiry(
                    10,
                    currentTime
                );

            expect(result).toHaveLength(0);
        });

        test("rejects a negative threshold", () => {
            expect(() => {
                releaseTimerService.getSessionsNearingExpiry(-5);
            }).toThrow();
        });
    });

    describe("sendReminder()", () => {

        test("sends a reminder for the specified session", () => {
            const session = {
                id: 1,
                expectedEndTime: new Date("2026-09-12T10:05:00")
            };

            releaseTimerService.sendReminder(session);

            expect(
                notificationService.sendReminder
            ).toHaveBeenCalledTimes(1);

            expect(
                notificationService.sendReminder
            ).toHaveBeenCalledWith(session);
        });

        test("does not end the session when sending a reminder", () => {
            const session = {
                id: 1,
                expectedEndTime: new Date("2026-09-12T10:05:00")
            };

            releaseTimerService.sendReminder(session);

            expect(
                sessionManager.endSession
            ).not.toHaveBeenCalled();
        });
    });

    describe("autoReleaseSession()", () => {

        test("automatically releases an expired session", () => {
            const session = {
                id: 123
            };

            releaseTimerService.autoReleaseSession(session);

            expect(
                sessionManager.endSession
            ).toHaveBeenCalledTimes(1);

            expect(
                sessionManager.endSession
            ).toHaveBeenCalledWith(
                123,
                "auto_released"
            );
        });

        test("rejects an invalid session", () => {
            expect(() => {
                releaseTimerService.autoReleaseSession(null);
            }).toThrow();
        });
    });

    describe("checkExpiredSessions()", () => {

        test("automatically releases an expired session", () => {
            const currentTime = new Date("2026-09-12T10:10:00");

            const expiredSession = {
                id: 1,
                expectedEndTime: new Date("2026-09-12T10:05:00"),
                isExpired: jest.fn().mockReturnValue(true)
            };

            sessionManager.getActiveSessions.mockReturnValue([
                expiredSession
            ]);

            releaseTimerService.checkExpiredSessions(currentTime);

            expect(
                expiredSession.isExpired
            ).toHaveBeenCalledWith(currentTime);

            expect(
                sessionManager.endSession
            ).toHaveBeenCalledWith(
                1,
                "auto_released"
            );
        });

        test("does not release a session that has not expired", () => {
            const currentTime = new Date("2026-09-12T10:00:00");

            const activeSession = {
                id: 1,
                expectedEndTime: new Date("2026-09-12T10:30:00"),
                isExpired: jest.fn().mockReturnValue(false)
            };

            sessionManager.getActiveSessions.mockReturnValue([
                activeSession
            ]);

            releaseTimerService.checkExpiredSessions(currentTime);

            expect(
                sessionManager.endSession
            ).not.toHaveBeenCalled();
        });

        test("sends one reminder to a session nearing expiry", () => {
            const currentTime = new Date("2026-09-12T10:00:00");

            const session = {
                id: 1,
                expectedEndTime: new Date("2026-09-12T10:05:00"),
                isExpired: jest.fn().mockReturnValue(false)
            };

            sessionManager.getActiveSessions.mockReturnValue([
                session
            ]);

            releaseTimerService.checkExpiredSessions(currentTime);

            expect(
                notificationService.sendReminder
            ).toHaveBeenCalledTimes(1);

            expect(
                notificationService.sendReminder
            ).toHaveBeenCalledWith(session);
        });

        test("does not send the same reminder repeatedly", () => {
            const currentTime = new Date("2026-09-12T10:00:00");

            const session = {
                id: 1,
                expectedEndTime: new Date("2026-09-12T10:05:00"),
                isExpired: jest.fn().mockReturnValue(false)
            };

            sessionManager.getActiveSessions.mockReturnValue([
                session
            ]);

            // Simulate two timer checks.
            releaseTimerService.checkExpiredSessions(currentTime);
            releaseTimerService.checkExpiredSessions(
                new Date("2026-09-12T10:01:00")
            );

            expect(
                notificationService.sendReminder
            ).toHaveBeenCalledTimes(1);
        });
    });

    describe("start() and stop()", () => {

        test("starts the timer", () => {
            jest.useFakeTimers();

            releaseTimerService.start();

            expect(releaseTimerService.timer).not.toBeNull();
        });

        test("does not create multiple timers", () => {
            jest.useFakeTimers();

            releaseTimerService.start();

            const firstTimer = releaseTimerService.timer;

            releaseTimerService.start();

            expect(
                releaseTimerService.timer
            ).toBe(firstTimer);
        });

        test("stops the timer", () => {
            jest.useFakeTimers();

            releaseTimerService.start();
            releaseTimerService.stop();

            expect(
                releaseTimerService.timer
            ).toBeNull();
        });

        test("automatically checks sessions at the specified interval", () => {
            jest.useFakeTimers();

            const session = {
                id: 1,
                expectedEndTime: new Date(
                    Date.now() + 60000
                ),
                isExpired: jest.fn().mockReturnValue(false)
            };

            sessionManager.getActiveSessions.mockReturnValue([
                session
            ]);

            releaseTimerService.start();

            // Advance the fake clock by one second.
            jest.advanceTimersByTime(1000);

            expect(
                sessionManager.getActiveSessions
            ).toHaveBeenCalled();
        });
    });

    describe("multiple active sessions", () => {

        test("checks each active session independently", () => {
            const currentTime = new Date("2026-09-12T10:00:00");

            const expiredSession = {
                id: 1,
                expectedEndTime: new Date("2026-09-12T09:55:00"),
                isExpired: jest.fn().mockReturnValue(true)
            };

            const activeSession = {
                id: 2,
                expectedEndTime: new Date("2026-09-12T10:30:00"),
                isExpired: jest.fn().mockReturnValue(false)
            };

            sessionManager.getActiveSessions.mockReturnValue([
                expiredSession,
                activeSession
            ]);

            releaseTimerService.checkExpiredSessions(currentTime);

            expect(
                expiredSession.isExpired
            ).toHaveBeenCalledWith(currentTime);

            expect(
                activeSession.isExpired
            ).toHaveBeenCalledWith(currentTime);

            expect(
                sessionManager.endSession
            ).toHaveBeenCalledTimes(1);

            expect(
                sessionManager.endSession
            ).toHaveBeenCalledWith(
                1,
                "auto_released"
            );
        });
    });
});

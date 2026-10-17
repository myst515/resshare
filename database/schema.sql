-- ResShare Database Schema

CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL DEFAULT 'resident'
                    CHECK (role IN ('resident', 'admin')),
    floor_number    INTEGER
);

CREATE TABLE facilities (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    type            VARCHAR(50)  NOT NULL,
    location        VARCHAR(100) NOT NULL,
    floor_number    INTEGER      NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'available'
                    CHECK (status IN ('available', 'in_use', 'suspended')),
    last_confirmed  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE usage_logs (
    id              SERIAL PRIMARY KEY,
    session_id      INTEGER      NOT NULL,
    facility_id     INTEGER      NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    user_id         INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time      TIMESTAMP    NOT NULL,
    end_time        TIMESTAMP,
    release_type    VARCHAR(20)  NOT NULL DEFAULT 'manual'
                    CHECK (release_type IN ('manual', 'automatic'))
);

-- ResShare Announcements Schema
-- Creates a table to store building-wide and floor-specific administrative broadcasts.

CREATE TABLE announcements (
    id            SERIAL PRIMARY KEY,
    title         VARCHAR(150) NOT NULL,
    body          TEXT NOT NULL,
    floor_number  INTEGER DEFAULT NULL, -- NULL represents 'All Floors' (visible to every resident)
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed initial broadcasts for testing
INSERT INTO announcements (title, body, floor_number) VALUES
('General Notice', 'Welcome to ResShare! Please ensure you book facilities before use.', NULL),
('Dryer #2 filter maintenance', 'Scheduled for monthly filter maintenance tomorrow between 09:00–11:00 AM.', 2),
('Kitchen deep cleaning', 'The Floor 1 shared kitchen will be closed for deep cleaning this Friday.', 1);

-- Helpful indexes for common lookups
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_facility_id ON usage_logs(facility_id);
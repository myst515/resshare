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

-- Helpful indexes for common lookups
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_facility_id ON usage_logs(facility_id);
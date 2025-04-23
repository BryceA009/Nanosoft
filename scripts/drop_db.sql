-- Terminate all sessions
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'postgres';

-- Drop the DB
DROP DATABASE postgres;
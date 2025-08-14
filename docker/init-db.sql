-- Initialize PropDocs database with required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create development database if it doesn't exist
SELECT 'CREATE DATABASE propdocs_dev' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'propdocs_dev');

-- Create test database if it doesn't exist  
SELECT 'CREATE DATABASE propdocs_test' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'propdocs_test');

-- Set timezone to UTC
ALTER DATABASE propdocs_dev SET timezone TO 'UTC';
ALTER DATABASE propdocs_test SET timezone TO 'UTC';
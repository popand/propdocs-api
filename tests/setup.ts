// Global test setup
import 'jest';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
process.env.PORT = '0'; // Use random available port for tests

// Increase timeout for integration tests
jest.setTimeout(10000);
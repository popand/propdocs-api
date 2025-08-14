import dotenv from 'dotenv';
import path from 'path';

// Load environment-specific .env file
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Fallback to .env file
dotenv.config();

export interface EnvironmentConfig {
  // Server
  nodeEnv: string;
  port: number;
  host: string;
  logLevel: string;

  // Database
  databaseUrl: string;
  databaseTestUrl: string | undefined;

  // Redis
  redisUrl: string;

  // JWT
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;

  // Rate Limiting
  rateLimitMax: number;
  rateLimitWindow: string;

  // CORS
  allowedOrigins: string[];

  // AWS
  awsAccessKeyId: string | undefined;
  awsSecretAccessKey: string | undefined;
  awsS3Bucket: string | undefined;
  awsRegion: string | undefined;

  // Email
  emailFrom: string | undefined;
  smtpHost: string | undefined;
  smtpPort: number | undefined;
  smtpUser: string | undefined;
  smtpPassword: string | undefined;

  // AI Services
  openaiApiKey: string | undefined;
  googleVisionApiKey: string | undefined;

  // Auth Providers
  appleTeamId: string | undefined;
  appleKeyId: string | undefined;
  applePrivateKeyPath: string | undefined;
  googleClientId: string | undefined;
  googleClientSecret: string | undefined;

  // Monitoring
  sentryDsn: string | undefined;
  datadogApiKey: string | undefined;
}

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

function getOptionalEnvVar(
  name: string,
  defaultValue?: string
): string | undefined {
  return process.env[name] || defaultValue;
}

function getNumberEnvVar(name: string, defaultValue: number): number {
  const value = process.env[name];
  return value ? parseInt(value, 10) : defaultValue;
}

function getOptionalNumberEnvVar(name: string): number | undefined {
  const value = process.env[name];
  return value ? parseInt(value, 10) : undefined;
}

export const config: EnvironmentConfig = {
  // Server
  nodeEnv: getRequiredEnvVar('NODE_ENV'),
  port: getNumberEnvVar('PORT', 3000),
  host: getOptionalEnvVar('HOST', '0.0.0.0') || '0.0.0.0',
  logLevel: getOptionalEnvVar('LOG_LEVEL', 'info') || 'info',

  // Database
  databaseUrl: getRequiredEnvVar('DATABASE_URL'),
  databaseTestUrl: getOptionalEnvVar('DATABASE_TEST_URL'),

  // Redis
  redisUrl: getRequiredEnvVar('REDIS_URL'),

  // JWT
  jwtSecret: getRequiredEnvVar('JWT_SECRET'),
  jwtRefreshSecret: getRequiredEnvVar('JWT_REFRESH_SECRET'),
  jwtExpiresIn: getOptionalEnvVar('JWT_EXPIRES_IN', '15m') || '15m',
  jwtRefreshExpiresIn:
    getOptionalEnvVar('JWT_REFRESH_EXPIRES_IN', '7d') || '7d',

  // Rate Limiting
  rateLimitMax: getNumberEnvVar('RATE_LIMIT_MAX', 100),
  rateLimitWindow:
    getOptionalEnvVar('RATE_LIMIT_WINDOW', '1 minute') || '1 minute',

  // CORS
  allowedOrigins: getOptionalEnvVar('ALLOWED_ORIGINS')?.split(',') || [],

  // AWS
  awsAccessKeyId: getOptionalEnvVar('AWS_ACCESS_KEY_ID'),
  awsSecretAccessKey: getOptionalEnvVar('AWS_SECRET_ACCESS_KEY'),
  awsS3Bucket: getOptionalEnvVar('AWS_S3_BUCKET'),
  awsRegion: getOptionalEnvVar('AWS_REGION'),

  // Email
  emailFrom: getOptionalEnvVar('EMAIL_FROM'),
  smtpHost: getOptionalEnvVar('SMTP_HOST'),
  smtpPort: getOptionalNumberEnvVar('SMTP_PORT'),
  smtpUser: getOptionalEnvVar('SMTP_USER'),
  smtpPassword: getOptionalEnvVar('SMTP_PASSWORD'),

  // AI Services
  openaiApiKey: getOptionalEnvVar('OPENAI_API_KEY'),
  googleVisionApiKey: getOptionalEnvVar('GOOGLE_VISION_API_KEY'),

  // Auth Providers
  appleTeamId: getOptionalEnvVar('APPLE_TEAM_ID'),
  appleKeyId: getOptionalEnvVar('APPLE_KEY_ID'),
  applePrivateKeyPath: getOptionalEnvVar('APPLE_PRIVATE_KEY_PATH'),
  googleClientId: getOptionalEnvVar('GOOGLE_CLIENT_ID'),
  googleClientSecret: getOptionalEnvVar('GOOGLE_CLIENT_SECRET'),

  // Monitoring
  sentryDsn: getOptionalEnvVar('SENTRY_DSN'),
  datadogApiKey: getOptionalEnvVar('DATADOG_API_KEY'),
};

import dotenv from 'dotenv';
import path from 'path';

// Load .env.local first, then .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

export interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  host: string;
  logLevel: string;
  databaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  supabaseJwtSecret: string;
  rateLimitMax: number;
  rateLimitWindow: string;
  allowedOrigins: string[];
}

export const config: EnvironmentConfig = {
  nodeEnv: process.env['NODE_ENV'] || 'development',
  port: parseInt(process.env['PORT'] || '3000', 10),
  host: process.env['HOST'] || '0.0.0.0',
  logLevel: process.env['LOG_LEVEL'] || 'info',
  databaseUrl: process.env['DATABASE_URL'] || '',
  supabaseUrl: process.env['SUPABASE_URL'] || '',
  supabaseAnonKey: process.env['SUPABASE_ANON_KEY'] || '',
  supabaseServiceRoleKey: process.env['SUPABASE_SERVICE_ROLE_KEY'] || '',
  supabaseJwtSecret: process.env['SUPABASE_JWT_SECRET'] || '',
  rateLimitMax: parseInt(process.env['RATE_LIMIT_MAX'] || '100', 10),
  rateLimitWindow: process.env['RATE_LIMIT_WINDOW'] || '1 minute',
  allowedOrigins: process.env['ALLOWED_ORIGINS']?.split(',') || [],
};

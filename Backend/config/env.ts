import 'dotenv/config';

/**
 * Centralized, validated environment configuration.
 *
 * Reading `process.env.X` directly throughout the codebase makes it easy for
 * a typo'd or missing variable to silently fall back to an insecure default
 * (this previously happened with JWT secrets and the CORS origin). Loading
 * and validating everything once, at startup, means the app fails fast with
 * a clear error instead of misbehaving quietly in production.
 */

interface EnvConfig {
  nodeEnv: 'development' | 'production' | 'test';
  isProduction: boolean;
  port: number;
  db: {
    databaseUrl?: string;
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
    poolMax: number;
    ssl: boolean;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  bcryptRounds: number;
  bodyLimit: string;
  /** Allowed CORS origins, parsed from a comma-separated FRONTEND_URL. */
  allowedOrigins: string[];
}

const REQUIRED_IN_PRODUCTION = ['JWT_SECRET', 'JWT_REFRESH_SECRET'] as const;

const INSECURE_DEFAULTS = new Set([
  'fallback_secret_change_in_production',
  'fallback_refresh_secret',
  'change_this_to_a_long_random_string',
  'change_this_to_a_different_long_random_string',
]);

function loadEnv(): EnvConfig {
  const nodeEnv = (process.env.NODE_ENV || 'development') as EnvConfig['nodeEnv'];
  const isProduction = nodeEnv === 'production';

  if (isProduction) {
    const missing = REQUIRED_IN_PRODUCTION.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variable(s) in production: ${missing.join(', ')}`
      );
    }
    if (!process.env.DATABASE_URL && !process.env.DB_PASSWORD) {
      throw new Error(
        'Missing database configuration: set either DATABASE_URL or DB_PASSWORD in production.'
      );
    }
  }

  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_change_in_production';
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';

  if (isProduction && (INSECURE_DEFAULTS.has(jwtSecret) || INSECURE_DEFAULTS.has(jwtRefreshSecret))) {
    throw new Error(
      'JWT_SECRET / JWT_REFRESH_SECRET are set to placeholder values. Generate strong random secrets before running in production.'
    );
  }

  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    nodeEnv,
    isProduction,
    port: parseInt(process.env.PORT || '5000', 10),
    db: {
      databaseUrl: process.env.DATABASE_URL,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      name: process.env.DB_NAME || 'sprintflow_db',
      poolMax: parseInt(process.env.DB_POOL_MAX || '20', 10),
      ssl: process.env.DB_SSL === 'true',
    },
    jwt: {
      secret: jwtSecret,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      refreshSecret: jwtRefreshSecret,
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    bodyLimit: process.env.BODY_LIMIT || '1mb',
    allowedOrigins,
  };
}

export const env = loadEnv();
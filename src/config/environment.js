import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.preprocess((value) => (value === undefined ? 4001 : Number(value)), z.number().int().positive()),
  APP_NAME: z.string().default('school-platform-backend'),
  APP_VERSION: z.string().default('1.0.0'),
  BUILD_TIME: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  DB_CLIENT: z.enum(['sqlite', 'mysql', 'postgres', 'sqlserver']).default('sqlite'),
  DATABASE_PATH: z.string().default('./data/app.db'),
  JWT_SECRET: z.string().default('please-change-this'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  SESSION_TIMEOUT_MINUTES: z.preprocess((value) => (value === undefined ? 30 : Number(value)), z.number().int().positive()),
  OTP_EXPIRATION_MINUTES: z.preprocess((value) => (value === undefined ? 5 : Number(value)), z.number().int().positive()),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  SMS_PROVIDER: z.string().optional(),
  SMS_API_KEY: z.string().optional(),
  SMS_SENDER: z.string().optional(),
  WHATSAPP_API_URL: z.string().optional(),
  WHATSAPP_API_KEY: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),
  WHATSAPP_APP_SECRET: z.string().optional(),
  WHATSAPP_PROVIDER: z.string().optional(),
  WHATSAPP_ACCOUNT_SID: z.string().optional(),
  WHATSAPP_AUTH_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_FROM_NUMBER: z.string().optional(),
  WHATSAPP_PHONE_NUMBER: z.string().optional()
});

const parsed = EnvironmentSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
  throw new Error(`Environment validation failed: ${errors}`);
}

export const environment = parsed.data;
export const initializeEnvironment = () => environment;

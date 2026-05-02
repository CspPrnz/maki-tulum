import { z } from 'zod';

const NodeEnv = z.enum(['development', 'test', 'staging', 'production']);

export const ApiEnvSchema = z.object({
  NODE_ENV: NodeEnv.default('development'),
  APP_ENV: z.enum(['local', 'staging', 'production']).default('local'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_PRIVATE_KEY: z.string().min(32),
  JWT_PUBLIC_KEY: z.string().min(32),
  CORS_ORIGINS: z
    .string()
    .default('')
    .transform((s) => s.split(',').map((o) => o.trim()).filter(Boolean)),
  RATE_LIMIT_REDIS_PREFIX: z.string().default('maki:rl'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  HOSTAWAY_CLIENT_ID: z.string().optional(),
  HOSTAWAY_CLIENT_SECRET: z.string().optional(),
  POSTMARK_SERVER_TOKEN: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
});

export type ApiEnv = z.infer<typeof ApiEnvSchema>;

export const WebEnvSchema = z.object({
  NODE_ENV: NodeEnv.default('development'),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
});

export type WebEnv = z.infer<typeof WebEnvSchema>;

/**
 * Parse env or throw with a helpful message. Call once at process start.
 */
export function parseEnv<T extends z.ZodTypeAny>(schema: T, source: NodeJS.ProcessEnv): z.infer<T> {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return parsed.data;
}

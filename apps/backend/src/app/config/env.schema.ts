import { z } from 'zod';

const envSchema = z.object({
  // App
  PORT: z.coerce.number().default(3333),

  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5433),
  DB_USERNAME: z.string().default('freello'),
  DB_PASSWORD: z.string().min(1),
  DB_DATABASE: z.string().default('freello'),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),

  // Rate limiting
  RATE_LIMIT_TTL: z.coerce.number().default(60),
  RATE_LIMIT_LIMIT: z.coerce.number().default(100),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:4200'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment configuration:');
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }

  return result.data;
}
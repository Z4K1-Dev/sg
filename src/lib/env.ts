import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  UPLOAD_PATH: z.string().default('./public/uploads'),
  TEMP_UPLOAD_PATH: z.string().default('./temp/uploads'),
  MAX_IMAGE_SIZE: z.string().default('2000').transform((val) => {
    const num = Number(val);
    if (isNaN(num)) throw new Error('MAX_IMAGE_SIZE must be a number');
    return num;
  }),
  IMAGE_COMPRESSION_QUALITY: z.string().default('80').transform((val) => {
    const num = Number(val);
    if (isNaN(num) || num < 10 || num > 100) throw new Error('IMAGE_COMPRESSION_QUALITY must be a number between 10 and 100');
    return num;
  }),
  ALLOWED_IMAGE_TYPES: z.string().default('jpeg,jpg,png,gif,webp'),
  MAX_FILE_SIZE: z.string().default('52428800').transform((val) => {
    const num = Number(val);
    if (isNaN(num)) throw new Error('MAX_FILE_SIZE must be a number');
    return num;
  }),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation error:');
      const formattedErrors = error.format();
      console.error(JSON.stringify(formattedErrors, null, 2));
    }
    throw new Error('Environment validation failed');
  }
}

export const envConfig = validateEnv();
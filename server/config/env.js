import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
dotenv.config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env'),
});

export const config = {
  port: process.env.PORT || 8080,
  db: process.env.MONGO_URI,
  jwt: process.env.JWT_SECRET || 'fallback_secret',
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  resourceBucket: process.env.SUPABASE_RESOURCE_BUCKET || 'Resources',
  avatarBucket: process.env.SUPABASE_AVATAR_BUCKET || 'Profile photos',
  verificationBucket: process.env.SUPABASE_VERIFICATION_BUCKET || process.env.SUPABASE_AVATAR_BUCKET || 'Profile photos',
  corsOrigins: (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

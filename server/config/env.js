import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 8080,
  db: process.env.MONGO_URI,
  jwt: process.env.JWT_SECRET || 'fallback_secret',
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  resourceBucket: process.env.SUPABASE_RESOURCE_BUCKET || 'Resources',
  avatarBucket: process.env.SUPABASE_AVATAR_BUCKET || 'Profile photos',
  verificationBucket: process.env.SUPABASE_VERIFICATION_BUCKET || 'Verification documents',
  corsOrigins: (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

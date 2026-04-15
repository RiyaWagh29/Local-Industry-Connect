import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';

let supabaseClient = null;

const sanitizeFileName = (name = 'file') =>
  name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');

const getSupabase = () => {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    throw new Error('Supabase storage is not configured');
  }

  if (!supabaseClient) {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return supabaseClient;
};

export const uploadBufferToSupabase = async ({ bucket, file, folder }) => {
  if (!file?.buffer) {
    throw new Error('No file buffer provided');
  }

  const supabase = getSupabase();
  const extension = file.originalname?.includes('.') ? file.originalname.split('.').pop() : '';
  const baseName = sanitizeFileName(file.originalname?.replace(/\.[^.]+$/, '') || 'file');
  const objectPath = `${folder}/${Date.now()}-${baseName}${extension ? `.${extension}` : ''}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(objectPath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);

  return {
    path: objectPath,
    publicUrl: data.publicUrl,
  };
};

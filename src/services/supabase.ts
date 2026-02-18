import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://uaavnblndwnlxdbsuxes.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BUCKET = 'instrumentals';

/**
 * Upload an instrumental audio blob to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadInstrumental(blob: Blob, filename: string): Promise<string> {
    const path = `public/${Date.now()}_${filename}`;

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, {
            contentType: 'audio/wav',
            upsert: false,
        });

    if (error) {
        throw new Error(`Supabase upload failed: ${error.message}`);
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
}

/**
 * Get the public URL for an instrumental file path.
 */
export function getInstrumentalUrl(path: string): string {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
}

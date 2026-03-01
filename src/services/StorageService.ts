import { supabaseAdmin } from '../config/supabase';
import { randomUUID } from 'crypto';

export class StorageService {
  private bucket = 'propdocs';

  async upload(
    file: Buffer,
    originalName: string,
    mimeType: string,
    folder: string
  ): Promise<{ path: string; url: string }> {
    const ext = originalName.split('.').pop() || 'bin';
    const path = `${folder}/${randomUUID()}.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from(this.bucket)
      .upload(path, file, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(this.bucket).getPublicUrl(path);

    return { path, url: publicUrl };
  }

  async delete(path: string): Promise<void> {
    const { error } = await supabaseAdmin.storage
      .from(this.bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Storage delete failed: ${error.message}`);
    }
  }
}

export const storageService = new StorageService();

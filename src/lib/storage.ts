import type { SupabaseClient } from "@supabase/supabase-js";

export const SERVICE_IMAGES_BUCKET = "service-images";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // mirrors the bucket's file_size_limit
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export interface UploadResult {
  url?: string;
  error?: string;
}

/**
 * Uploads one image to the public `service-images` bucket under the owner's
 * folder, which is what the bucket's RLS policies key on. Returns the public
 * URL to store on the row.
 */
export async function uploadServiceImage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  ownerId: string,
  file: File
): Promise<UploadResult> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: "صيغة الصورة غير مدعومة — استخدم JPG أو PNG أو WebP" };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: "حجم الصورة يجب أن يكون أقل من ٥ ميجابايت" };
  }

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(SERVICE_IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { error: "تعذّر رفع الصورة، حاول مرة أخرى" };

  const { data } = supabase.storage.from(SERVICE_IMAGES_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

/** True when the form field holds a file the user actually picked. */
export function isFilledFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

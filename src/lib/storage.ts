import type { DemoClient } from "@/lib/db/server";

export const SERVICE_IMAGES_BUCKET = "service-images";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export interface UploadResult {
  url?: string;
  error?: string;
}

/**
 * Uploads one image and returns the URL to store on the row.
 *
 * In demo mode the bytes are kept in memory and served by
 * `/api/demo-image/<path>`, so an upload lives as long as the server instance
 * does. Files are still namespaced under the owner's id.
 */
export async function uploadServiceImage(
  client: DemoClient,
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

  const { error } = await client.storage
    .from(SERVICE_IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) return { error: "تعذّر رفع الصورة، حاول مرة أخرى" };

  const { data } = client.storage.from(SERVICE_IMAGES_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

/** True when the form field holds a file the user actually picked. */
export function isFilledFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

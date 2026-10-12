"use server";

import { createClient } from "@/lib/db/server";
import { revalidatePath } from "next/cache";
import { isFilledFile, uploadServiceImage } from "@/lib/storage";

export interface FormState {
  error?: string;
  success?: string;
}

/** إدارة التصميم (module 6) — add a decor concept to an event's moodboard. */
export async function createDesignConceptAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "الرجاء تسجيل الدخول" };

  const eventId = String(formData.get("event_id") || "");
  const title = String(formData.get("title") || "").trim();
  if (!eventId || !title) return { error: "الرجاء كتابة عنوان التصميم" };

  let imageUrl: string | null = null;
  const image = formData.get("image");
  if (isFilledFile(image)) {
    const upload = await uploadServiceImage(supabase, user.id, image);
    if (upload.error) return { error: upload.error };
    imageUrl = upload.url ?? null;
  }

  const palette = String(formData.get("palette") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabase.from("design_concepts").insert({
    event_id: eventId,
    title,
    style: String(formData.get("style") || "") || null,
    palette,
    estimated_cost: formData.get("estimated_cost") ? Number(formData.get("estimated_cost")) : null,
    images: imageUrl ? [imageUrl] : [],
  });

  if (error) return { error: "تعذّر إضافة التصميم" };

  revalidatePath(`/dashboard/client/events/${eventId}/design`);
  return { success: "تمت إضافة التصميم إلى لوحة المناسبة" };
}

/** Marks one concept as the approved design for the event. */
export async function selectDesignConceptAction(eventId: string, conceptId: string) {
  const supabase = await createClient();

  await supabase.from("design_concepts").update({ is_selected: false }).eq("event_id", eventId);
  await supabase.from("design_concepts").update({ is_selected: true }).eq("id", conceptId);

  revalidatePath(`/dashboard/client/events/${eventId}/design`);
}

export async function deleteDesignConceptAction(eventId: string, conceptId: string) {
  const supabase = await createClient();
  await supabase.from("design_concepts").delete().eq("id", conceptId);
  revalidatePath(`/dashboard/client/events/${eventId}/design`);
}

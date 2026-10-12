"use server";

import { createClient } from "@/lib/db/server";
import { revalidatePath } from "next/cache";

export async function setProviderStatusAction(providerId: string, status: "approved" | "rejected" | "suspended") {
  const supabase = await createClient();
  await supabase.from("provider_profiles").update({ status }).eq("id", providerId);
  revalidatePath("/dashboard/admin/providers");
}

export async function createKbArticleAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("knowledge_base").insert({
    category: String(formData.get("category") || "عام"),
    title: String(formData.get("title")),
    content: String(formData.get("content")),
    tags: String(formData.get("tags") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    created_by: user?.id,
  });

  revalidatePath("/dashboard/admin/knowledge-base");
  revalidatePath("/knowledge-base");
}

export async function deleteKbArticleAction(id: string) {
  const supabase = await createClient();
  await supabase.from("knowledge_base").delete().eq("id", id);
  revalidatePath("/dashboard/admin/knowledge-base");
  revalidatePath("/knowledge-base");
}

export async function setQualityStatusAction(bookingId: string, status: "passed" | "flagged" | "failed", notes: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: existing } = await supabase.from("quality_checks").select("id").eq("booking_id", bookingId).maybeSingle();

  if (existing) {
    await supabase.from("quality_checks").update({ status, notes, reviewed_by: user?.id }).eq("id", existing.id);
  } else {
    await supabase.from("quality_checks").insert({ booking_id: bookingId, status, notes, reviewed_by: user?.id, checklist: [] });
  }

  revalidatePath("/dashboard/admin/quality");
}

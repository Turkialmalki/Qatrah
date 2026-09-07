"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface FormState {
  error?: string;
}

export async function createHallAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "الرجاء تسجيل الدخول" };

  const { error } = await supabase.from("halls").insert({
    provider_id: user.id,
    name: String(formData.get("name")),
    city: String(formData.get("city") || "الرياض"),
    address: String(formData.get("address") || ""),
    capacity_min: Number(formData.get("capacity_min") || 0),
    capacity_max: Number(formData.get("capacity_max") || 100),
    base_price: Number(formData.get("base_price") || 0),
    amenities: String(formData.get("amenities") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  });

  if (error) return { error: "حدث خطأ أثناء إضافة القاعة" };
  revalidatePath("/dashboard/provider/halls");
  return {};
}

export async function deleteHallAction(id: string) {
  const supabase = await createClient();
  await supabase.from("halls").delete().eq("id", id);
  revalidatePath("/dashboard/provider/halls");
}

export async function toggleHallAction(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("halls").update({ is_active: !isActive }).eq("id", id);
  revalidatePath("/dashboard/provider/halls");
}

export async function createServiceAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "الرجاء تسجيل الدخول" };

  const { error } = await supabase.from("services").insert({
    provider_id: user.id,
    category: String(formData.get("category") || "other"),
    title: String(formData.get("title")),
    description: String(formData.get("description") || ""),
    unit: String(formData.get("unit") || "package"),
    base_price: Number(formData.get("base_price") || 0),
    min_price: formData.get("min_price") ? Number(formData.get("min_price")) : null,
    max_price: formData.get("max_price") ? Number(formData.get("max_price")) : null,
  });

  if (error) return { error: "حدث خطأ أثناء إضافة الخدمة" };
  revalidatePath("/dashboard/provider/services");
  return {};
}

export async function deleteServiceAction(id: string) {
  const supabase = await createClient();
  await supabase.from("services").delete().eq("id", id);
  revalidatePath("/dashboard/provider/services");
}

export async function toggleServiceAction(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("services").update({ is_active: !isActive }).eq("id", id);
  revalidatePath("/dashboard/provider/services");
}

export async function respondToMatchAction(matchId: string, status: "quoted" | "declined", price?: number) {
  const supabase = await createClient();
  const payload: Record<string, unknown> = { status };
  if (price != null) payload.quoted_price = price;
  await supabase.from("matches").update(payload).eq("id", matchId);
  revalidatePath("/dashboard/provider/requests");
}

export async function updateTaskStatusAction(taskId: string, status: string) {
  const supabase = await createClient();
  await supabase.from("execution_tasks").update({ status }).eq("id", taskId);
  revalidatePath("/dashboard/provider/tasks");
}

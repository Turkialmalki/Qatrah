"use server";

import { createClient } from "@/lib/db/server";
import { revalidatePath } from "next/cache";
import { findPackage } from "@/lib/catalog/packages";
import { isFilledFile, uploadServiceImage } from "@/lib/storage";
import type { ProviderCategory } from "@/lib/types/database";

export interface FormState {
  error?: string;
  success?: string;
}

/** A provider writing their own listing must describe it properly. */
const MIN_CUSTOM_DESCRIPTION = 80;

export async function createHallAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "الرجاء تسجيل الدخول" };

  let imageUrl: string | null = null;
  const image = formData.get("image");
  if (isFilledFile(image)) {
    const upload = await uploadServiceImage(supabase, user.id, image);
    if (upload.error) return { error: upload.error };
    imageUrl = upload.url ?? null;
  }

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
    images: imageUrl ? [imageUrl] : [],
  });

  if (error) return { error: "حدث خطأ أثناء إضافة القاعة" };
  revalidatePath("/dashboard/provider/halls");
  return { success: "تمت إضافة القاعة" };
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

/**
 * Adds a service. Two routes in:
 *   - `package_key` set  → a ready-made platform package; title, price and
 *     inclusions come from the catalogue, so no upload is needed.
 *   - `package_key` empty → the provider's own listing, which must carry a
 *     photo and a description of at least 80 characters. The same rule is
 *     enforced in the database by `services_custom_requires_media`.
 */
export async function createServiceAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "الرجاء تسجيل الدخول" };

  const packageKey = String(formData.get("package_key") || "").trim();

  if (packageKey) {
    const pkg = findPackage(packageKey);
    if (!pkg) return { error: "الباقة المختارة غير متوفرة" };

    // Price is adjustable — a provider may undercut or exceed the suggested
    // package price — but the inclusions stay as the platform defined them.
    const price = Number(formData.get("base_price") || pkg.basePrice);

    const { error } = await supabase.from("services").insert({
      provider_id: user.id,
      category: pkg.category,
      title: pkg.title,
      description: pkg.description,
      unit: pkg.unit,
      base_price: price > 0 ? price : pkg.basePrice,
      package_key: pkg.key,
      inclusions: pkg.inclusions,
    });

    if (error) return { error: "حدث خطأ أثناء إضافة الباقة" };
    revalidatePath("/dashboard/provider/services");
    return { success: `تمت إضافة باقة «${pkg.title}»` };
  }

  // --- custom listing -------------------------------------------------
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "other") as ProviderCategory;
  const basePrice = Number(formData.get("base_price") || 0);

  if (!title) return { error: "الرجاء كتابة اسم الخدمة" };
  if (basePrice <= 0) return { error: "الرجاء إدخال سعر صحيح للخدمة" };
  if (description.length < MIN_CUSTOM_DESCRIPTION) {
    return {
      error: `عند عدم اختيار باقة جاهزة، يجب كتابة شرح كامل للخدمة (${description.length}/${MIN_CUSTOM_DESCRIPTION} حرف على الأقل)`,
    };
  }

  const image = formData.get("image");
  if (!isFilledFile(image)) {
    return { error: "عند عدم اختيار باقة جاهزة، يجب رفع صورة توضح خدمتك" };
  }

  const upload = await uploadServiceImage(supabase, user.id, image);
  if (upload.error) return { error: upload.error };

  const inclusions = String(formData.get("inclusions") || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabase.from("services").insert({
    provider_id: user.id,
    category,
    title,
    description,
    unit: String(formData.get("unit") || "package"),
    base_price: basePrice,
    package_key: null,
    inclusions,
    images: upload.url ? [upload.url] : [],
  });

  if (error) return { error: "حدث خطأ أثناء إضافة الخدمة" };
  revalidatePath("/dashboard/provider/services");
  return { success: "تمت إضافة الخدمة" };
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

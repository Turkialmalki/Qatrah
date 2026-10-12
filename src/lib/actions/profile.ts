"use server";

import { createClient } from "@/lib/db/server";
import { revalidatePath } from "next/cache";
import type { ProviderCategory } from "@/lib/types/database";

export interface FormState {
  error?: string;
  success?: string;
}

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "الرجاء تسجيل الدخول" };

  const fullName = String(formData.get("full_name") || "").trim();
  if (!fullName) return { error: "الرجاء كتابة الاسم الكامل" };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: String(formData.get("phone") || "") || null,
      city: String(formData.get("city") || "") || null,
    })
    .eq("id", user.id);

  if (error) return { error: "تعذّر تحديث البيانات" };
  revalidatePath("/dashboard/client/profile");
  revalidatePath("/dashboard/provider/profile");
  return { success: "تم تحديث بياناتك" };
}

/**
 * Updates the provider's business details, including the full set of
 * categories they serve — a provider may offer several services at once.
 * `category` is kept in sync as the primary/display category.
 */
export async function updateProviderProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "الرجاء تسجيل الدخول" };

  const businessName = String(formData.get("business_name") || "").trim();
  if (!businessName) return { error: "الرجاء كتابة اسم المنشأة" };

  const categories = (formData.getAll("categories") as string[]).filter(Boolean) as ProviderCategory[];
  if (categories.length === 0) {
    return { error: "الرجاء اختيار مجال خدمة واحد على الأقل" };
  }

  const primary = (String(formData.get("primary_category") || "") || categories[0]) as ProviderCategory;

  const { error } = await supabase
    .from("provider_profiles")
    .update({
      business_name: businessName,
      category: categories.includes(primary) ? primary : categories[0],
      categories,
      bio: String(formData.get("bio") || "") || null,
      base_city: String(formData.get("base_city") || "الرياض"),
      years_experience: Number(formData.get("years_experience") || 0),
      commercial_registration: String(formData.get("commercial_registration") || "") || null,
    })
    .eq("id", user.id);

  if (error) return { error: "تعذّر تحديث بيانات المنشأة" };

  revalidatePath("/dashboard/provider/profile");
  revalidatePath("/dashboard/provider");
  return { success: "تم تحديث بيانات منشأتك" };
}

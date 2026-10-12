"use client";

import { useActionState, useState } from "react";
import clsx from "clsx";
import { signUpAction, type AuthState } from "@/lib/actions/auth";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS, CITIES } from "@/lib/utils";
import type { ProviderCategory } from "@/lib/types/database";

const initialState: AuthState = {};

const ALL_CATEGORIES: ProviderCategory[] = [
  "hall",
  "catering",
  "decor",
  "photography",
  "music",
  "planning",
  "av",
  "translation",
  "booths",
  "security",
  "transport",
  "other",
];

export function SignupForm({ defaultRole }: { defaultRole: "client" | "provider" }) {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);
  const [role, setRole] = useState<"client" | "provider">(defaultRole);
  const [categories, setCategories] = useState<ProviderCategory[]>(["hall"]);

  function toggle(cat: ProviderCategory) {
    setCategories((cur) => (cur.includes(cat) ? cur.filter((c) => c !== cat) : [...cur, cat]));
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <Label>نوع الحساب</Label>
        <div className="grid grid-cols-2 gap-2">
          {(["client", "provider"] as const).map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setRole(r)}
              className={clsx(
                "rounded-xl border px-3 py-2.5 text-sm font-semibold transition",
                role === r
                  ? "border-gold-500 bg-gold-100 text-navy-950"
                  : "border-navy-900/15 text-navy-900/60 hover:border-navy-900/30"
              )}
            >
              {r === "client" ? "عميل" : "مقدم خدمة"}
            </button>
          ))}
        </div>
        <input type="hidden" name="role" value={role} />
      </div>

      <div>
        <Label htmlFor="full_name">الاسم الكامل</Label>
        <Input id="full_name" name="full_name" required placeholder="اسمك الكامل" />
      </div>

      {role === "provider" && (
        <>
          <div>
            <Label htmlFor="business_name">اسم المنشأة / النشاط</Label>
            <Input id="business_name" name="business_name" placeholder="اسم منشأتك التجارية" />
          </div>

          <div>
            <Label>مجالات الخدمة</Label>
            <p className="mb-2 text-xs leading-5 text-navy-900/55">
              يمكنك تقديم عدة خدمات — اختر كل مجال تعمل فيه، ويمكنك تعديلها لاحقاً.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const active = categories.includes(cat);
                return (
                  <label
                    key={cat}
                    className={clsx(
                      "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition",
                      active
                        ? "border-gold-500 bg-gold-100 text-navy-950"
                        : "border-navy-900/15 text-navy-900/60 hover:border-navy-900/30"
                    )}
                  >
                    <input
                      type="checkbox"
                      name="categories"
                      value={cat}
                      checked={active}
                      onChange={() => toggle(cat)}
                      className="h-3.5 w-3.5 accent-[#c9a227]"
                    />
                    {CATEGORY_LABELS[cat]}
                  </label>
                );
              })}
            </div>
            {categories.length === 0 && (
              <p className="mt-2 text-xs font-semibold text-red-600">اختر مجال خدمة واحداً على الأقل</p>
            )}
          </div>

          <div>
            <Label htmlFor="city">مدينة التشغيل</Label>
            <Select id="city" name="city" defaultValue="الرياض">
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
        </>
      )}

      <div>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input id="email" name="email" type="email" required placeholder="you@example.com" />
      </div>
      <div>
        <Label htmlFor="password">كلمة المرور</Label>
        <Input id="password" name="password" type="password" required minLength={6} placeholder="6 أحرف على الأقل" />
      </div>

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{state.error}</p>}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={pending || (role === "provider" && categories.length === 0)}
      >
        {pending ? "جاري الإنشاء..." : "إنشاء الحساب"}
      </Button>

      {role === "provider" && (
        <p className="text-center text-xs leading-5 text-navy-900/50">
          سيتم مراجعة حسابك من قبل الإدارة قبل ظهور خدماتك للعملاء
        </p>
      )}
    </form>
  );
}

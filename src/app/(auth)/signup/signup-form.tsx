"use client";

import { useActionState, useState } from "react";
import { signUpAction, type AuthState } from "@/lib/actions/auth";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/lib/utils";
import clsx from "clsx";

const initialState: AuthState = {};

export function SignupForm({ defaultRole }: { defaultRole: "client" | "provider" }) {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);
  const [role, setRole] = useState<"client" | "provider">(defaultRole);

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
                role === r ? "border-gold-500 bg-gold-100 text-navy-950" : "border-navy-900/15 text-navy-900/60 hover:border-navy-900/30"
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
            <Label htmlFor="category">مجال الخدمة</Label>
            <Select id="category" name="category" defaultValue="hall">
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
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

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "جاري الإنشاء..." : "إنشاء الحساب"}
      </Button>

      {role === "provider" && (
        <p className="text-center text-xs text-navy-900/50">
          سيتم مراجعة حسابك من قبل الإدارة قبل ظهور خدماتك للعملاء
        </p>
      )}
    </form>
  );
}

"use client";

import { useState } from "react";
import { useActionState } from "react";
import clsx from "clsx";
import { Check } from "lucide-react";
import { updateProviderProfileAction, type FormState } from "@/lib/actions/profile";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { SectionTitle } from "@/components/dashboard/shell";
import { CATEGORY_LABELS, CATEGORY_TAGLINES, CITIES } from "@/lib/utils";
import { packagesForCategory } from "@/lib/catalog/packages";
import type { ProviderCategory, ProviderProfile } from "@/lib/types/database";

const initialState: FormState = {};

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

/**
 * A provider is not limited to one line of business — they tick every category
 * they serve here, and each one becomes available when adding services.
 */
export function ProviderProfileForm({
  profile,
  initialCategories,
}: {
  profile: ProviderProfile;
  initialCategories: ProviderCategory[];
}) {
  const [state, formAction, pending] = useActionState(updateProviderProfileAction, initialState);
  const [categories, setCategories] = useState<ProviderCategory[]>(initialCategories);
  const [primary, setPrimary] = useState<ProviderCategory>(profile.category);

  function toggle(cat: ProviderCategory) {
    setCategories((cur) => {
      const next = cur.includes(cat) ? cur.filter((c) => c !== cat) : [...cur, cat];
      // Keep the primary category inside the selected set.
      if (!next.includes(primary) && next.length > 0) setPrimary(next[0]);
      return next;
    });
  }

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <Card>
        <CardBody className="space-y-4">
          <SectionTitle title="بيانات المنشأة" />

          <div>
            <Label htmlFor="business_name">اسم المنشأة</Label>
            <Input id="business_name" name="business_name" defaultValue={profile.business_name} required />
          </div>

          <div>
            <Label htmlFor="bio">نبذة عن المنشأة</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={profile.bio ?? ""}
              placeholder="اكتب نبذة تعرّف العملاء بخبرتك وما يميز أعمالك."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="base_city">مدينة التشغيل</Label>
              <Select id="base_city" name="base_city" defaultValue={profile.base_city ?? "الرياض"}>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="years_experience">سنوات الخبرة</Label>
              <Input
                id="years_experience"
                name="years_experience"
                type="number"
                min={0}
                max={80}
                defaultValue={profile.years_experience ?? 0}
              />
            </div>
            <div>
              <Label htmlFor="commercial_registration">السجل التجاري</Label>
              <Input
                id="commercial_registration"
                name="commercial_registration"
                defaultValue={profile.commercial_registration ?? ""}
                placeholder="رقم السجل"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ---- multi-category selection ---- */}
      <Card>
        <CardBody>
          <SectionTitle
            title="مجالات الخدمة"
            hint="يمكنك تقديم عدة خدمات — اختر كل مجال تعمل فيه، وستتمكن من إضافة باقاته في صفحة خدماتي"
          />

          <div className="grid gap-2 sm:grid-cols-2">
            {ALL_CATEGORIES.map((cat) => {
              const active = categories.includes(cat);
              const pkgCount = packagesForCategory(cat).length;
              return (
                <label
                  key={cat}
                  className={clsx(
                    "flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition",
                    active ? "border-gold-400 bg-gold-100/40" : "border-navy-900/10 hover:border-navy-900/25"
                  )}
                >
                  <input
                    type="checkbox"
                    name="categories"
                    value={cat}
                    checked={active}
                    onChange={() => toggle(cat)}
                    className="mt-0.5 h-4 w-4 accent-[#c9a227]"
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-navy-900">
                      {CATEGORY_LABELS[cat]}
                      {active && <Check className="h-3.5 w-3.5 text-green-700" />}
                    </span>
                    <span className="block text-xs leading-5 text-navy-900/50">{CATEGORY_TAGLINES[cat]}</span>
                    {pkgCount > 0 && (
                      <span className="mt-1 block text-[11px] font-semibold text-gold-600">
                        {pkgCount} باقة جاهزة متاحة
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>

          {categories.length === 0 && (
            <p className="mt-2 text-xs font-semibold text-red-600">اختر مجال خدمة واحداً على الأقل</p>
          )}

          <div className="mt-5 border-t border-navy-900/8 pt-4">
            <Label htmlFor="primary_category">المجال الرئيسي</Label>
            <Select
              id="primary_category"
              name="primary_category"
              value={primary}
              onChange={(e) => setPrimary(e.target.value as ProviderCategory)}
              disabled={categories.length === 0}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
            <p className="mt-1.5 text-xs text-navy-900/50">
              المجال الذي تُعرف به منشأتك في دليل مقدمي الخدمة.
            </p>
          </div>
        </CardBody>
      </Card>

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{state.error}</p>}
      {state.success && (
        <p className="rounded-lg bg-green-800/10 px-3 py-2 text-sm font-semibold text-green-800">{state.success}</p>
      )}

      <Button type="submit" size="lg" disabled={pending || categories.length === 0}>
        {pending ? "جاري الحفظ..." : "حفظ بيانات المنشأة"}
      </Button>
    </form>
  );
}

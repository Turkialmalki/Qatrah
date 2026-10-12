"use client";

import { useActionState, useMemo, useState } from "react";
import { Check, PackageCheck, PencilLine } from "lucide-react";
import clsx from "clsx";
import { createServiceAction, type FormState } from "@/lib/actions/provider";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageField } from "@/components/ui/image-field";
import { CATEGORY_LABELS, formatSAR } from "@/lib/utils";
import { TIER_LABELS, UNIT_LABELS, packagesForCategory } from "@/lib/catalog/packages";
import type { ProviderCategory } from "@/lib/types/database";

const initialState: FormState = {};
const MIN_DESCRIPTION = 80;

/**
 * Two ways to list a service:
 *   - adopt a ready-made platform package (one click, nothing to write), or
 *   - write a custom listing, which requires a photo and a full description.
 */
export function NewServiceForm({ categories }: { categories: ProviderCategory[] }) {
  const [state, formAction, pending] = useActionState(createServiceAction, initialState);

  const [category, setCategory] = useState<ProviderCategory>(categories[0] ?? "catering");
  const [packageKey, setPackageKey] = useState<string>("");
  const [description, setDescription] = useState("");

  const packages = useMemo(() => packagesForCategory(category), [category]);
  const selectedPkg = packages.find((p) => p.key === packageKey);
  const isCustom = packageKey === "";
  const descriptionShort = description.trim().length < MIN_DESCRIPTION;

  function changeCategory(next: ProviderCategory) {
    setCategory(next);
    setPackageKey(""); // package keys are category-specific
  }

  return (
    <Card className="h-fit">
      <CardBody>
        <h3 className="font-bold text-navy-950">إضافة خدمة</h3>
        <p className="mt-1 text-xs leading-5 text-navy-900/55">
          اختر باقة جاهزة لتضيفها بضغطة واحدة، أو اكتب خدمتك المخصصة — وفي هذه الحالة يلزم رفع صورة وشرح كامل.
        </p>

        <form action={formAction} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="category">مجال الخدمة</Label>
            <Select
              id="category"
              name="category"
              value={category}
              onChange={(e) => changeCategory(e.target.value as ProviderCategory)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
            {categories.length === 1 && (
              <p className="mt-1.5 text-xs text-navy-900/50">
                لإضافة مجالات أخرى، حدّث مجالات الخدمة في{" "}
                <a href="/dashboard/provider/profile" className="font-semibold text-gold-600 hover:underline">
                  ملف المنشأة
                </a>
                .
              </p>
            )}
          </div>

          {/* ---- ready-made packages ---- */}
          <div>
            <Label>الباقات الجاهزة</Label>
            {packages.length === 0 ? (
              <p className="rounded-xl border border-navy-900/10 bg-cream-dark/60 px-3 py-2.5 text-xs text-navy-900/55">
                لا توجد باقات جاهزة لهذا المجال — اكتب تفاصيل خدمتك بالأسفل.
              </p>
            ) : (
              <div className="space-y-2">
                {packages.map((pkg) => {
                  const active = packageKey === pkg.key;
                  return (
                    <button
                      type="button"
                      key={pkg.key}
                      onClick={() => setPackageKey(pkg.key)}
                      className={clsx(
                        "w-full rounded-xl border p-3 text-right transition",
                        active
                          ? "border-gold-500 bg-gold-100/50"
                          : "border-navy-900/10 hover:border-gold-400/70 hover:bg-gold-100/20"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-navy-950">{pkg.title}</span>
                            <Badge tone={active ? "gold" : "gray"}>{TIER_LABELS[pkg.tier]}</Badge>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-navy-900/60">{pkg.description}</p>
                        </div>
                        <div className="shrink-0 text-left">
                          <div className="text-sm font-bold text-navy-950">{formatSAR(pkg.basePrice)}</div>
                          <div className="text-[10px] text-navy-900/50">{UNIT_LABELS[pkg.unit]}</div>
                        </div>
                      </div>
                      {active && (
                        <ul className="mt-2.5 space-y-1 border-t border-gold-400/40 pt-2.5">
                          {pkg.inclusions.map((inc) => (
                            <li key={inc} className="flex items-start gap-1.5 text-xs text-navy-900/70">
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-700" />
                              {inc}
                            </li>
                          ))}
                        </ul>
                      )}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setPackageKey("")}
                  className={clsx(
                    "flex w-full items-center gap-2 rounded-xl border p-3 text-right text-sm font-semibold transition",
                    isCustom
                      ? "border-navy-900/40 bg-navy-900/5 text-navy-950"
                      : "border-navy-900/10 text-navy-900/60 hover:border-navy-900/25"
                  )}
                >
                  <PencilLine className="h-4 w-4 shrink-0" />
                  لا أريد باقة جاهزة — خدمة مخصصة
                </button>
              </div>
            )}
          </div>

          <input type="hidden" name="package_key" value={packageKey} />

          {/* ---- adopted package: price only ---- */}
          {selectedPkg && (
            <div className="rounded-xl border border-gold-400/40 bg-gold-100/30 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold text-navy-900">
                <PackageCheck className="h-4 w-4 text-gold-600" />
                باقة جاهزة — الاسم والمحتويات معتمدة من المنصة
              </div>
              <Label htmlFor="base_price">سعرك للباقة (ريال)</Label>
              <Input
                id="base_price"
                name="base_price"
                type="number"
                min={1}
                defaultValue={selectedPkg.basePrice}
                required
              />
              <p className="mt-1.5 text-xs text-navy-900/55">
                السعر المقترح {formatSAR(selectedPkg.basePrice)} {UNIT_LABELS[selectedPkg.unit]} — يمكنك تعديله.
              </p>
            </div>
          )}

          {/* ---- custom listing: image + full description are required ---- */}
          {isCustom && (
            <div className="space-y-4 rounded-xl border border-navy-900/15 bg-cream-dark/40 p-3">
              <p className="text-xs font-semibold leading-5 text-navy-900/70">
                لأنك لم تختر باقة جاهزة، يجب رفع صورة توضح خدمتك وكتابة شرح كامل عنها.
              </p>

              <div>
                <Label htmlFor="title">
                  اسم الخدمة <span className="text-red-600">*</span>
                </Label>
                <Input id="title" name="title" required placeholder="مثال: تصميم ديكور بطابع نجدي" />
              </div>

              <ImageField name="image" label="صورة الخدمة" required hint="صورة واضحة من أعمالك السابقة" />

              <div>
                <Label htmlFor="description">
                  شرح كامل عن الخدمة <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  minLength={MIN_DESCRIPTION}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اشرح ما تقدمه بالتفصيل: ما يشمله العمل، المدة، عدد الأفراد، وما يميزك."
                />
                <p className={clsx("mt-1.5 text-xs font-semibold", descriptionShort ? "text-red-600" : "text-green-700")}>
                  {description.trim().length} / {MIN_DESCRIPTION} حرف
                  {descriptionShort ? " — الشرح قصير جداً" : " — الشرح مكتمل"}
                </p>
              </div>

              <div>
                <Label htmlFor="inclusions">ما تشمله الخدمة (سطر لكل بند)</Label>
                <Textarea
                  id="inclusions"
                  name="inclusions"
                  className="min-h-20"
                  placeholder={"تصميم ثلاثي الأبعاد\nالتركيب والفك\nفريق تنفيذ على الموقع"}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="custom_price">السعر (ريال)</Label>
                  <Input id="custom_price" name="base_price" type="number" min={1} required />
                </div>
                <div>
                  <Label htmlFor="unit">وحدة التسعير</Label>
                  <Select id="unit" name="unit" defaultValue="package">
                    {Object.entries(UNIT_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          )}

          {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{state.error}</p>}
          {state.success && (
            <p className="rounded-lg bg-green-800/10 px-3 py-2 text-sm font-semibold text-green-800">{state.success}</p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "جاري الإضافة..." : selectedPkg ? "إضافة الباقة" : "إضافة الخدمة"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

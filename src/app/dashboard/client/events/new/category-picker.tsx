"use client";

import { useState } from "react";
import clsx from "clsx";
import { Label } from "@/components/ui/input";
import { CATEGORY_LABELS, CATEGORY_TAGLINES } from "@/lib/utils";
import type { ProviderCategory } from "@/lib/types/database";

const PRIORITIES = [
  { value: 1, label: "أولوية منخفضة جداً" },
  { value: 2, label: "أولوية منخفضة" },
  { value: 3, label: "أولوية متوسطة" },
  { value: 4, label: "أولوية عالية" },
  { value: 5, label: "أولوية قصوى" },
];

/**
 * Picks the service categories an event needs and their priority, which the
 * budget optimization engine uses to split the total budget. Shared by both
 * the social-occasion and conference creation forms.
 */
export function CategoryPicker({
  categories,
  defaultSelected,
  onSelectionChange,
}: {
  categories: ProviderCategory[];
  defaultSelected: ProviderCategory[];
  onSelectionChange?: (selected: ProviderCategory[]) => void;
}) {
  const [selected, setSelected] = useState<ProviderCategory[]>(defaultSelected);

  function toggle(cat: ProviderCategory) {
    setSelected((s) => {
      const next = s.includes(cat) ? s.filter((c) => c !== cat) : [...s, cat];
      onSelectionChange?.(next);
      return next;
    });
  }

  return (
    <div>
      <Label>الخدمات المطلوبة وأولويتها</Label>
      <p className="mb-3 text-xs leading-5 text-navy-900/55">
        اختر الخدمات، وحدد أولوية كل منها ليوزع محرك تحسين الميزانية المبلغ بشكل عادل
      </p>

      <div className="space-y-2">
        {categories.map((cat) => {
          const active = selected.includes(cat);
          return (
            <div
              key={cat}
              className={clsx(
                "rounded-xl border p-3 transition",
                active ? "border-gold-400 bg-gold-100/40" : "border-navy-900/10"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    name="categories"
                    value={cat}
                    checked={active}
                    onChange={() => toggle(cat)}
                    className="mt-0.5 h-4 w-4 accent-[#c9a227]"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-navy-900">{CATEGORY_LABELS[cat]}</span>
                    <span className="block text-xs text-navy-900/50">{CATEGORY_TAGLINES[cat]}</span>
                  </span>
                </label>

                {active && (
                  <select
                    name={`priority_${cat}`}
                    defaultValue={3}
                    aria-label={`أولوية ${CATEGORY_LABELS[cat]}`}
                    className="rounded-lg border border-navy-900/15 bg-white px-2 py-1.5 text-xs font-semibold text-navy-900"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selected.length === 0 && (
        <p className="mt-2 text-xs font-semibold text-red-600">اختر خدمة واحدة على الأقل</p>
      )}
    </div>
  );
}

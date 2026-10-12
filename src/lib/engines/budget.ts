// محرك تحسين الميزانية — Budget Optimization Engine (rule-based)
// Splits a client's total budget across selected categories based on
// their declared priority (1..5) and typical market weight per category.

import type { ProviderCategory } from "@/lib/types/database";

// Baseline market share each category typically takes of an event budget.
const CATEGORY_BASE_WEIGHT: Record<ProviderCategory, number> = {
  hall: 0.38,
  catering: 0.22,
  decor: 0.15,
  photography: 0.1,
  music: 0.07,
  planning: 0.06,
  // conference & exhibition categories — audio/visual and exhibition stands
  // carry most of the cost once the venue is booked.
  av: 0.18,
  booths: 0.14,
  translation: 0.06,
  security: 0.05,
  transport: 0.04,
  other: 0.02,
};

export interface BudgetItemInput {
  category: ProviderCategory;
  priority: number; // 1..5, 5 = most important to the client
}

export interface BudgetAllocation {
  category: ProviderCategory;
  amount: number;
  pctOfTotal: number;
}

export function optimizeBudget(totalBudget: number, items: BudgetItemInput[]): BudgetAllocation[] {
  if (items.length === 0 || totalBudget <= 0) return [];

  const weighted = items.map((it) => {
    const base = CATEGORY_BASE_WEIGHT[it.category] ?? 0.1;
    const priorityMultiplier = 0.6 + it.priority * 0.2; // priority 1 -> 0.8x, priority 5 -> 1.6x
    return { ...it, weight: base * priorityMultiplier };
  });

  const totalWeight = weighted.reduce((s, w) => s + w.weight, 0);

  const allocations = weighted.map((w) => {
    const pct = w.weight / totalWeight;
    return {
      category: w.category,
      amount: Math.round(totalBudget * pct),
      pctOfTotal: Math.round(pct * 1000) / 10,
    };
  });

  // fix rounding drift on the largest item so amounts sum exactly to totalBudget
  const sum = allocations.reduce((s, a) => s + a.amount, 0);
  const drift = totalBudget - sum;
  if (allocations.length > 0 && drift !== 0) {
    const idx = allocations.reduce((maxIdx, a, i, arr) => (a.amount > arr[maxIdx].amount ? i : maxIdx), 0);
    allocations[idx].amount += drift;
  }

  return allocations.sort((a, b) => b.amount - a.amount);
}

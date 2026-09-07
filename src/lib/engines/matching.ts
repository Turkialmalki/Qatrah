// محرك المطابقة الذكية — Smart Matching Engine (rule-based, no external AI call)
// Scores each eligible provider/hall/service against an event requirement.

import type { EventRow, Hall, ProviderProfile, ServiceItem } from "@/lib/types/database";

export interface MatchCandidate {
  providerId: string;
  hallId?: string;
  serviceId?: string;
  score: number;
  breakdown: Record<string, number>;
  price: number;
}

const WEIGHTS = {
  budgetFit: 35,
  quality: 25,
  cityMatch: 15,
  capacityFit: 15,
  experience: 10,
} as const;

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

/** Score a hall against an event's budget/guest-count/city. */
export function scoreHall(event: EventRow, hall: Hall, provider: ProviderProfile, allocatedBudget: number): MatchCandidate {
  const breakdown: Record<string, number> = {};

  // Budget fit: closer the hall price is to the allocated budget (without exceeding it much), the better.
  const priceRatio = allocatedBudget > 0 ? hall.base_price / allocatedBudget : 1;
  breakdown.budgetFit =
    priceRatio <= 1
      ? WEIGHTS.budgetFit * (0.6 + 0.4 * priceRatio) // reward using the budget well, not lowballing
      : WEIGHTS.budgetFit * clamp(1 - (priceRatio - 1) * 1.5, 0, 1);

  // Quality score (0..5 -> weight)
  breakdown.quality = WEIGHTS.quality * (provider.quality_score / 5);

  // City match
  breakdown.cityMatch = hall.city === event.city ? WEIGHTS.cityMatch : WEIGHTS.cityMatch * 0.3;

  // Capacity fit — penalize halls far too big or too small for guest count
  const capMid = (hall.capacity_min + hall.capacity_max) / 2;
  const capDiff = Math.abs(capMid - event.guest_count) / Math.max(event.guest_count, 1);
  breakdown.capacityFit =
    event.guest_count >= hall.capacity_min && event.guest_count <= hall.capacity_max
      ? WEIGHTS.capacityFit
      : WEIGHTS.capacityFit * clamp(1 - capDiff, 0, 1);

  // Experience / track record
  breakdown.experience = WEIGHTS.experience * clamp(provider.completed_jobs / 20, 0, 1);

  const score = clamp(Object.values(breakdown).reduce((a, b) => a + b, 0));

  return { providerId: provider.id, hallId: hall.id, score: Math.round(score * 10) / 10, breakdown, price: hall.base_price };
}

/** Score a service against an event requirement's allocated budget. */
export function scoreService(
  event: EventRow,
  service: ServiceItem,
  provider: ProviderProfile,
  allocatedBudget: number
): MatchCandidate {
  const breakdown: Record<string, number> = {};

  const priceRatio = allocatedBudget > 0 ? service.base_price / allocatedBudget : 1;
  breakdown.budgetFit =
    priceRatio <= 1
      ? WEIGHTS.budgetFit * (0.6 + 0.4 * priceRatio)
      : WEIGHTS.budgetFit * clamp(1 - (priceRatio - 1) * 1.5, 0, 1);

  breakdown.quality = WEIGHTS.quality * (provider.quality_score / 5);
  breakdown.cityMatch = provider.base_city === event.city ? WEIGHTS.cityMatch : WEIGHTS.cityMatch * 0.3;
  breakdown.capacityFit = WEIGHTS.capacityFit * 0.8; // services aren't capacity-bound; near-neutral
  breakdown.experience = WEIGHTS.experience * clamp(provider.completed_jobs / 20, 0, 1);

  const score = clamp(Object.values(breakdown).reduce((a, b) => a + b, 0));

  return {
    providerId: provider.id,
    serviceId: service.id,
    score: Math.round(score * 10) / 10,
    breakdown,
    price: service.base_price,
  };
}

export function rankCandidates(candidates: MatchCandidate[], limit = 5): MatchCandidate[] {
  return [...candidates].sort((a, b) => b.score - a.score).slice(0, limit);
}

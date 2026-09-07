// محرك التسعير العادل — Fair Pricing Engine (rule-based)
// Flags prices that deviate too far from the market average for the same
// category/city, so clients see transparent, justified pricing.

export interface MarketSample {
  price: number;
}

export interface FairPriceResult {
  marketAverage: number;
  deltaPct: number; // positive = above market, negative = below market
  verdict: "fair" | "above_market" | "below_market" | "unrated";
  fairnessIndex: number; // 0..1, 1 = perfectly aligned with market
}

export function computeFairPrice(price: number, marketSamples: MarketSample[]): FairPriceResult {
  if (marketSamples.length === 0) {
    return { marketAverage: price, deltaPct: 0, verdict: "unrated", fairnessIndex: 1 };
  }

  const marketAverage =
    marketSamples.reduce((sum, s) => sum + s.price, 0) / marketSamples.length;

  const deltaPct = marketAverage > 0 ? ((price - marketAverage) / marketAverage) * 100 : 0;

  let verdict: FairPriceResult["verdict"] = "fair";
  if (deltaPct > 15) verdict = "above_market";
  else if (deltaPct < -15) verdict = "below_market"; // suspiciously cheap can mean corner-cutting

  const fairnessIndex = Math.max(0, 1 - Math.abs(deltaPct) / 100);

  return {
    marketAverage: Math.round(marketAverage),
    deltaPct: Math.round(deltaPct * 10) / 10,
    verdict,
    fairnessIndex: Math.round(fairnessIndex * 100) / 100,
  };
}

/** Rolls a provider's historical fair-price deltas into their fair_price_index (0.5..1.5, 1 = perfectly fair). */
export function updateFairPriceIndex(previousIndex: number, latestDeltaPct: number): number {
  const normalized = 1 + latestDeltaPct / 100;
  const smoothed = previousIndex * 0.8 + normalized * 0.2; // exponential smoothing
  return Math.round(Math.min(1.5, Math.max(0.5, smoothed)) * 100) / 100;
}

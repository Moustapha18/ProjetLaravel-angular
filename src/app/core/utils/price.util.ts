export function discountedPriceCents(p: any): number {
  const base = p?.price_cents ?? 0;
  const percent = p?.percent_off ?? p?.promotion?.percent_off ?? p?.promo?.percent_off ?? 0;
  return Math.max(0, Math.round(base * (100 - percent) / 100));
}

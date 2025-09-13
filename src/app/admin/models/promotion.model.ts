export type PromotionAppliesTo = 'ORDER' | 'PRODUCT' | 'CATEGORY';
export type PromotionType = 'PERCENT' | 'FIXED';

export interface Promotion {
  id?: number;
  name: string;
  code?: string | null;
  applies_to: PromotionAppliesTo;
  type: PromotionType;
  value: number;               // % ou cents selon type
  min_order_cents?: number | null;
  active: boolean;
  start_at?: string | null;    // ISO string
  end_at?: string | null;      // ISO string
  description?: string | null;
  products?: { id:number; name:string }[]; // renvoyé par l'API
}

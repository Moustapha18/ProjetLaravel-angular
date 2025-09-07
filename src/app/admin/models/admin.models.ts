export interface Category {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Promotion {
  id: number;
  name: string;             // ex: "Promo rentrée"
  percent_off: number;      // 0..100
  starts_at?: string | null;
  ends_at?: string | null;
  product_ids?: number[];   // ids produits ciblés
  created_at?: string;
  updated_at?: string;
}

export interface AdminStats {
  totals: {
    products: number;
    orders: number;
    customers: number;
    revenue_cents: number;
  };
  sales_over_time: Array<{ date: string; total_cents: number }>;
}

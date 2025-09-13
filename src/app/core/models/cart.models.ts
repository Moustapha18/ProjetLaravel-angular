export interface CartItem {
//  unit_price_cents: number;
  product: any;
  qty: any;
  product_id: number;
  name: string;
  price_cents: number;
  quantity: number;           // ← on standardise sur "quantity"
  image_url?: string | null;
}

export interface CartSnapshot {
  items: CartItem[];
  total_cents: number;
}

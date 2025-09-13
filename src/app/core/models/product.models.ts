import { Category } from './category.models';
// src/app/core/models/product.models.ts
export interface Product {
[x: string]: any;
  id: number;
  name: string;
  slug?: string;
  price_cents: number;
  stock?: number | null;
  description?: string | null;
  category_id?: number | null;
  image_path?: string | null;
    discounted_cents?: number;   // 👈 NEW
  has_promo?: boolean; 
  // ...ajoute si besoin
}

export interface Meta {
  current_page: number;
  last_page: number;
  total: number;
}

export interface CreateProductPayload {
  name: string;
  price_cents: number;

  // ⬇️ deviens optionnel/nullable pour matcher le backend (nullable) et le formulaire (non requis)
  category_id?: number | null;

  stock?: number | null;
  percent_off?: number | null;
  description?: string;
}




export interface ApiList<T> {
data: T[];
meta?: { current_page?: number; last_page?: number; per_page?: number; total?: number };
}
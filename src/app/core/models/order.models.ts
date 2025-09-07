export type OrderStatus = 'EN_PREPARATION' | 'PRETE' | 'EN_LIVRAISON' | 'LIVREE';


export interface OrderItem {
qty: any;
product: any;
product_id: number;
name?: string; // si renvoyé par l'API
quantity: number;
unit_price_cents: number;
}


export interface Order {
paid: any;
id: number;
customer_id?: number;
status: OrderStatus;
total_cents: number;
items: OrderItem[];
created_at?: string;
}


export interface ApiList<T> {
data: T[];
meta?: { current_page?: number; last_page?: number; per_page?: number; total?: number };
}
import { Injectable, signal, computed } from '@angular/core';
import { CartItem, CartSnapshot } from '../models/cart.models';
import { discountedPriceCents } from '../utils/price.util';

const LS_KEY = 'cart_v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  // état interne (chargé depuis localStorage)
  private itemsSig = signal<CartItem[]>(this.load());

  // exposés (signals)
  items = computed(() => this.itemsSig());
  count = computed(() => this.itemsSig().reduce((n, it) => n + it.quantity, 0));
  total_cents = computed(() => this.itemsSig().reduce((s, it) => s + it.price_cents * it.quantity, 0));
  cart: any;

  /** Total remisé (si percent_off est pris en compte via discountedPriceCents) */
  getTotalCentsDiscounted(): number {
    const snap = this.snapshot();
    return (snap.items || []).reduce((sum: number, it: any) => {
      const line = (discountedPriceCents(it) || 0) * (it.quantity || 1);
      return sum + line;
    }, 0);
  }

  /** Ajoute un produit (ou incrémente la quantité) */
  add(p: { id:number; name:string; price_cents:number; image_url?:string|null }, qty = 1) {
    const list = [...this.itemsSig()];
    const idx = list.findIndex(x => x.product_id === p.id);

    if (idx >= 0) {
      list[idx] = { ...list[idx], quantity: list[idx].quantity + qty };
    } else {
      list.push({
        product_id: p.id,
        name: p.name,
        price_cents: p.price_cents,
        quantity: Math.max(1, qty),
        image_url: p.image_url ?? null,
        product: undefined,
        qty: undefined
      });
    }

    this.itemsSig.set(list);
    this.persist();
  }

  /** Fixe une quantité pour un produit (min 1) */
  setQuantity(product_id: number, qty: number) {
    const list = this.itemsSig().map(it =>
      it.product_id === product_id
        ? { ...it, quantity: Math.max(1, Math.trunc(qty)) }
        : it
    );
    this.itemsSig.set(list);
    this.persist();
  }

  /** Retire un produit du panier */
  remove(product_id: number) {
    this.itemsSig.set(this.itemsSig().filter(it => it.product_id !== product_id));
    this.persist();
  }

  /** Vide le panier */
  clear() {
    this.itemsSig.set([]);
    this.persist();
  }

  /** Snapshot (ex pour checkout) */
  snapshot(): CartSnapshot {
    return { items: this.itemsSig(), total_cents: this.total_cents() };
  }

  addToCart(p: any) {
  this.cart.add(
    {
      id: p.id,
      name: p.name,
      price_cents: p.price_cents,
      image_url: p.image_url ?? null
    },
    1
  );
}
// // cart.service.ts (ajouter dans la classe)
// qtyOf(product_id: number): number {
//   const it = this.itemsSig().find(x => x.product_id === product_id);
//   return it ? it.quantity : 0;
// }

// inc(product_id: number) {
//   const it = this.itemsSig().find(x => x.product_id === product_id);
//   if (!it) return;
//   this.setQuantity(product_id, it.quantity + 1);
// }

// dec(product_id: number) {
//   const it = this.itemsSig().find(x => x.product_id === product_id);
//   if (!it) return;
//   if (it.quantity <= 1) {
//     this.remove(product_id);
//   } else {
//     this.setQuantity(product_id, it.quantity - 1);
//   }
// }


  // ======== internes ========

  /** Sauvegarde locale */
  private persist() {
    const snap: CartSnapshot = {
      items: this.itemsSig(),
      total_cents: this.total_cents()
    };
    localStorage.setItem(LS_KEY, JSON.stringify(snap));
  }

  /** Chargement local + compat (qty → quantity) */
  /** Hydrate le panier depuis le localStorage en gérant les anciens formats */
private load(): CartItem[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];

    // ancien format: array direct ; nouveau: snapshot { items, ... }
    const parsed: any = JSON.parse(raw);
    const items: any[] = Array.isArray(parsed) ? parsed : (parsed?.items ?? []);
    if (!Array.isArray(items)) return [];

    return items
      .filter((x: any) => x && (Number.isFinite(x.product_id) || Number.isFinite(x.id)))
      .map((x: any) => {
        const product_id = Number.isFinite(+x.product_id) ? +x.product_id : +x.id;

        // qty attendu par CartItem (on garde aussi "quantity" pour compat)
        const qty = Math.max(1, Number.isFinite(+x.qty) ? +x.qty : (Number.isFinite(+x.quantity) ? +x.quantity : 1));

        // prix unitaire en cents (ordre de priorité: unit_price_cents > price_cents > product.price_cents > 0)
        const unit_price_cents =
          Number.isFinite(+x.unit_price_cents) ? Math.trunc(+x.unit_price_cents) :
          Number.isFinite(+x.price_cents)      ? Math.trunc(+x.price_cents)      :
          Number.isFinite(+x?.product?.price_cents) ? Math.trunc(+x.product.price_cents) : 0;

        // objet product minimal requis par CartItem
        const product = x.product ?? {
          id: product_id,
          name: String(x.name ?? ''),
          price_cents: unit_price_cents,
          image_url: x.image_url ?? null,
        };

        // ✅ on renvoie un CartItem COMPLET (avec product & qty)
        const item = {
          product_id,
          qty,
          unit_price_cents,
          product,

          // champs legacy conservés pour compatibilité avec tes templates existants
          name: product.name,
          price_cents: unit_price_cents,
          quantity: qty,
          image_url: product.image_url ?? null,
        } as unknown as CartItem;

        return item;
      });
  } catch {
    return [];
  }
}

  // cart.service.ts (ajouter dans la classe)
qtyOf(product_id: number): number {
  const it = this.itemsSig().find(x => x.product_id === product_id);
  return it ? it.quantity : 0;
}

inc(product_id: number) {
  const it = this.itemsSig().find(x => x.product_id === product_id);
  if (!it) return;
  this.setQuantity(product_id, it.quantity + 1);
}

dec(product_id: number) {
  const it = this.itemsSig().find(x => x.product_id === product_id);
  if (!it) return;
  if (it.quantity <= 1) {
    this.remove(product_id);
  } else {
    this.setQuantity(product_id, it.quantity - 1);
  }
}

}

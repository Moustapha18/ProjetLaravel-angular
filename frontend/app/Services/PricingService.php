<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Promotion;

class PricingService
{
    /**
     * Calcule un devis à partir d'une liste d'items (product_id, qty).
     * Retourne: ['lines'=>[], 'subtotal'=>int, 'discount'=>int, 'total'=>int]
     */
    public function quote(array $items): array
    {
        $lines = [];
        $subtotal = 0;
        $discount = 0;

        // nécessite scopeActive() dans Promotion (voir patch #4)
        $promos = Promotion::active()->get();

        foreach ($items as $it) {
            $product = Product::findOrFail($it['product_id']);
            $qty = (int) $it['qty'];
            $unit = (int) $product->price_cents;
            $line = $unit * $qty;

            $best = 0;
            foreach ($promos as $p) {
                $applies = ($p->scope === 'PRODUCT'  && (int)$p->scope_id === (int)$product->id)
                    || ($p->scope === 'CATEGORY' && (int)$p->scope_id === (int)$product->category_id);

                if (! $applies) continue;

                $d = $p->type === 'PERCENT'
                    ? (int) round($line * (float)$p->value / 100)
                    : (int) round(((float)$p->value) * 100); // value en unités monétaires → *100 en centimes

                if ($d > $best) $best = $d;
            }

            $best = min($best, $line);
            $discount += $best;
            $subtotal += $line;

            $lines[] = [
                'product_id'        => $product->id,
                'qty'               => $qty,
                'unit_price_cents'  => $unit,
                'line_total_cents'  => $line - $best,
            ];
        }

        $total = max(0, $subtotal - $discount);

        return compact('lines', 'subtotal', 'discount', 'total');
    }
}

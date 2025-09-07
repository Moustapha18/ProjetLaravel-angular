<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request): array
    {
        $status = $this->status;
        if (is_object($status) && property_exists($status, 'value')) {
            $status = $status->value;
        } else {
            $status = (string) $status;
        }

        $items = $this->whenLoaded('items', function () {
            return $this->items->map(function ($it) {
                $qty = $it->qty ?? $it->quantity ?? ($it->attributes['qty'] ?? null);
                $lineTotal = $it->line_total_cents ?? $it->total_cents ?? ($it->attributes['line_total_cents'] ?? null);

                return [
                    'id'               => $it->id,
                    'product_id'       => $it->product_id,
                    'product_name'     => $it->product_name ?? ($it->relationLoaded('product') ? ($it->product->name ?? null) : null),
                    'unit_price_cents' => (int) ($it->unit_price_cents ?? 0),
                    'qty'              => (int) ($qty ?? 0),
                    'line_total_cents' => (int) ($lineTotal ?? 0),
                    'product'          => $it->relationLoaded('product')
                        ? [
                            'id'    => $it->product->id,
                            'name'  => $it->product->name,
                            'image' => $it->product->image_url ?? null,
                        ]
                        : null,
                ];
            })->all();
        });

        return [
            'id'           => $this->id,
            'status'       => $status,
            'address'      => $this->address,
            'total_cents'  => (int) $this->total_cents,
            'paid'         => (bool) ($this->paid ?? ($this->paid_at !== null)),
            'paid_at'      => optional($this->paid_at)->toISOString(),
            'created_at'   => optional($this->created_at)->toISOString(),
            'user'         => $this->whenLoaded('user', fn () => [
                'id'    => $this->user->id,
                'name'  => $this->user->name,
                'email' => $this->user->email,
            ]),
            'items'        => $items,
        ];
    }
}

<?php

namespace App\Services;

use App\Enums\DomainEvent;
use App\Models\Order;
use App\Models\WebhookEndpoint;
use App\Models\WebhookDelivery;
use App\Jobs\SendWebhookJob;

class WebhookService
{
    public function dispatchEvent(DomainEvent $event, array $payload): void
    {
        // sélectionne endpoints actifs qui écoutent cet event
        $endpoints = WebhookEndpoint::query()
            ->where('is_active', true)
            ->whereJsonContains('events', $event->value)
            ->get();

        foreach ($endpoints as $ep) {
            $delivery = WebhookDelivery::create([
                'webhook_endpoint_id' => $ep->id,
                'event'       => $event->value,
                'payload'     => $payload,
                'max_attempts'=> 5,
            ]);

            dispatch(new SendWebhookJob($delivery->id))->onQueue('webhooks');
        }
    }

    /**
     * Payloads prêts pour l’extérieur (pas d’infos sensibles).
     */
    public function orderPayload(Order $order): array
    {
        $order->loadMissing(['items.product','user','deliveryUpdates','invoice']);
        return [
            'id'          => $order->id,
            'status'      => $order->status->value ?? (string)$order->status,
            'total_cents' => $order->total_cents,
            'paid'        => (bool)$order->paid,
            'address'     => $order->address,
            'user'        => ['id'=>$order->user_id,'email'=>$order->user->email],
            'items'       => $order->items->map(fn($i)=>[
                'product_id' => $i->product_id,
                'name'       => $i->product->name,
                'qty'        => $i->qty,
                'unit_price_cents' => $i->unit_price_cents,
                'line_total_cents' => $i->line_total_cents,
            ])->values()->all(),
            'invoice'     => $order->invoice ? [
                'number'  => $order->invoice->number,
                'pdf_url' => $order->invoice->pdf_path ? asset('storage/'.$order->invoice->pdf_path) : null,
            ] : null,
            'occurred_at' => now()->toISOString(),
        ];
    }
}

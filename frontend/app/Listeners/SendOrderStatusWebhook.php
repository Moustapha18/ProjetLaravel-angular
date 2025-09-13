<?php

namespace App\Listeners;

use App\Events\OrderStatusUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Http;

class SendOrderStatusWebhook implements ShouldQueue
{
    public function handle(OrderStatusUpdated $e): void
    {
        $url = config('services.webhooks.order_status'); // mets ça dans config/services.php + .env
        if (!$url) return;

        Http::timeout(5)->post($url, [
            'order_id'  => $e->order->id,
            'old'       => $e->oldStatus,
            'new'       => $e->newStatus,
            'total'     => $e->order->total_cents,
            'user_email'=> $e->order->user?->email,
            'updated_at'=> now()->toIso8601String(),
        ]);
    }
}

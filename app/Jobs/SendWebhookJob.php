<?php

namespace App\Jobs;

use App\Models\WebhookDelivery;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\{InteractsWithQueue, SerializesModels};

class SendWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;
    public int $timeout = 15;

    public function __construct(public int $deliveryId) {
        $this->onQueue('webhooks');
    }

    public function backoff(): array
    {
        return [5, 15, 30, 60, 120]; // backoff progressif
    }

    public function handle(): void
    {
        /** @var WebhookDelivery $delivery */
        $delivery = WebhookDelivery::with('endpoint')->findOrFail($this->deliveryId);

        $endpoint = $delivery->endpoint;
        $payload  = $delivery->payload;
        $timestamp = time();
        $body = json_encode($payload, JSON_UNESCAPED_SLASHES);

        // Signature HMAC SHA-256 : base = "{timestamp}.{body}"
        $base = $timestamp.'.'.$body;
        $signature = hash_hmac('sha256', $base, $endpoint->secret);

        $response = Http::timeout(10)
            ->asJson()
            ->withHeaders([
                'X-Bakery-Timestamp' => $timestamp,
                'X-Bakery-Signature' => "v1={$signature}",
                'User-Agent'         => 'Bakery-Hook/1.0',
            ])
            ->post($endpoint->url, $payload);

        $delivery->attempts++;
        $delivery->status_code = $response->status();
        $delivery->error = $response->successful() ? null : ($response->body() ?: $response->reason());
        $delivery->sent_at = now();
        $delivery->save();

        if (!$response->successful()) {
            // relancer retry -> le worker gère via $tries/backoff
            $this->release($this->backoff()[min($delivery->attempts - 1, count($this->backoff()) - 1)]);
        }
    }

    public function failed(\Throwable $e): void
    {
        if ($delivery = WebhookDelivery::find($this->deliveryId)) {
            $delivery->error = $e->getMessage();
            $delivery->save();
        }
    }
}

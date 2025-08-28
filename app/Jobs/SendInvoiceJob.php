<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\InvoiceService;
use App\Notifications\InvoiceReadyNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendInvoiceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;       // 3 tentatives
    public int $timeout = 30;    // 30s
    public ?int $orderId;

    public function __construct(int $orderId)
    {
        $this->orderId = $orderId;
        $this->onQueue('mail'); // file dédiée (optionnel)
    }

    public function backoff(): array
    {
        return [10, 30, 60]; // retries progressifs
    }

    public function handle(InvoiceService $invoices): void
    {
        $order = Order::with(['user','items.product','invoice'])->findOrFail($this->orderId);

        // S’assure que la facture existe (idempotent)
        $invoice = $invoices->generate($order);

        // Notifie le client (via mail)
        $order->user->notify(new InvoiceReadyNotification($order->fresh('invoice')));
    }
}

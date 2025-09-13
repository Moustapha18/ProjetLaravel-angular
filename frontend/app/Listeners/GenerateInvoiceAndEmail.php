<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Services\InvoiceService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;
use App\Mail\InvoiceReadyMail;
use Illuminate\Support\Facades\Storage;

class GenerateInvoiceAndEmail // implements ShouldQueue  <- active-le plus tard si tu veux la file
{
    public function __construct(private InvoiceService $invoices) {}

    public function handle(OrderCreated $event): void
    {
        $order   = $event->order->load('items.product','user');
        $invoice = $this->invoices->generate($order); // crée si n’existe pas

        // lire le PDF depuis storage
        $pdfContent = Storage::disk('public')->get($invoice->pdf_path);

        Mail::to($order->user->email)
            ->send(new InvoiceReadyMail($order, $invoice, $pdfContent));
    }
}

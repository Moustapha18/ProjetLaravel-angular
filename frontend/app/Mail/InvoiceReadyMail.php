<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InvoiceReadyMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public Invoice $invoice,
        public string $pdfContent // binaire du PDF à attacher
    ) {}

    public function build()
    {
        return $this->subject('Votre facture - Commande #'.$this->order->id)
            ->markdown('emails.invoice_ready', [
                'order'   => $this->order,
                'invoice' => $this->invoice,
                'urlPdf'  => asset('storage/'.$this->invoice->pdf_path),
            ])
            ->attachData($this->pdfContent, $this->invoice->number.'.pdf', [
                'mime' => 'application/pdf',
            ]);
    }
}

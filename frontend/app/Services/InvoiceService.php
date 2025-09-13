<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Support\Str;

class InvoiceService
{
    public function generate(Order $order): Invoice
    {
        if ($order->invoice) {
            return $order->invoice;
        }

        $order->loadMissing(['items.product','user']);

        $number = 'INV-'.now()->format('Ymd').'-'.Str::padLeft((string)$order->id, 6, '0');

        $pdf = \PDF::loadView('invoices.show', ['order' => $order, 'number' => $number]);
        $path = "invoices/{$number}.pdf";

        \Storage::disk('public')->put($path, $pdf->output());

        return Invoice::create([
            'order_id' => $order->id,
            'number'   => $number,
            'pdf_path' => $path,
        ]);
    }
}

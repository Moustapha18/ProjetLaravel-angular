<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderStatusChangedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order, public string $oldStatus, public string $newStatus) {}

    public function build()
    {
        return $this->subject("Votre commande #{$this->order->id} est {$this->newStatus}")
            ->markdown('emails.orders.status', [
                'order' => $this->order,
                'old'   => $this->oldStatus,
                'new'   => $this->newStatus,
            ]);
    }
}

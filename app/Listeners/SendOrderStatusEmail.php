<?php

namespace App\Listeners;

use App\Events\OrderStatusUpdated;
use App\Mail\OrderStatusChangedMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class SendOrderStatusEmail implements ShouldQueue
{
    public function handle(OrderStatusUpdated $event): void
    {
        $order = $event->order->loadMissing('items.product','user');
        $user  = $order->user;

        if (!$user || !$user->email) return;

        Mail::to($user->email)->send(new OrderStatusChangedMail(
            $order, $event->oldStatus, $event->newStatus
        ));
    }
}

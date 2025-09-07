<?php

namespace App\Listeners;

use App\Events\OrderStatusUpdated;

class SendOrderStatusUpdatedNotification
{
    public function handle(OrderStatusUpdated $event): void
    {
        $event->order->loadMissing('user');
        $event->order->user?->notify(
            new \App\Notifications\OrderStatusUpdatedNotification($event->order, $event->old, $event->new)
        );
    }
}

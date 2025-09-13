<?php

namespace App\Listeners;

use App\Events\OrderCreated;

class SendOrderCreatedNotification
{
    public function handle(OrderCreated $event): void
    {
        $event->order->loadMissing('user');
        $event->order->user?->notify(new \App\Notifications\OrderCreatedNotification($event->order));
    }
}

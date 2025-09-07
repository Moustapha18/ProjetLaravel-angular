<?php

namespace App\Actions;

use App\Models\DeliveryUpdate;
use App\Models\Order;

class AddDeliveryUpdateAction
{
    /**
     * Ajoute une mise à jour de livraison pour une commande
     *
     * @param  \App\Models\Order $order
     * @param  string            $status
     * @param  string|null       $note
     * @return \App\Models\DeliveryUpdate
     */

    public function execute(Order $order, string $status, ?string $note = null): DeliveryUpdate
    {
        return DeliveryUpdate::create([
            'order_id' => $order->id,
            'status'   => $status,
            'note'     => $note,
        ]);
    }
}

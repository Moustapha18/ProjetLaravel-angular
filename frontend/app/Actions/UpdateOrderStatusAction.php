<?php
namespace App\Actions;

use App\Events\OrderStatusUpdated;
use App\Models\Order;
use Illuminate\Support\Arr;

class UpdateOrderStatusAction
{
    // transitions simples: E->P->EL->L
    private array $flow = [
        'EN_PREPARATION' => ['PRETE'],
        'PRETE'          => ['EN_LIVRAISON'],
        'EN_LIVRAISON'   => ['LIVREE'],
        'LIVREE'         => [],
    ];

    /**
     * Met à jour le statut d’une commande
     *
     * @param  \App\Models\Order $order
     * @param  string            $status
     * @return \App\Models\Order
     */
    public function execute(\App\Models\Order $order, string $newStatus): \App\Models\Order
    {
        $old = $order->status;
        // ... (tes validations de transition + $order->status = $newStatus)
        $order->status = $newStatus;
        $order->save();

        event(new OrderStatusUpdated($order, $old, $newStatus));

        return $order->fresh(['items.product','deliveryUpdates','user']);
    }

}

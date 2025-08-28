<?php

namespace App\Actions;

use App\Events\OrderCreated;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\PricingService;
use App\Services\StockService;
use Illuminate\Support\Facades\DB;

class CreateOrderAction
{
    public function __construct(
        private PricingService $pricing,
        private StockService $stock
    ) {}

    /**
     * Crée une commande complète (lignes calculées, stock décrémenté)
     * puis émet l'événement OrderCreated (génération facture + email).
     *
     * @param  int    $userId
     * @param  string $address
     * @param  array<int, array{product_id:int, qty:int}> $items
     * @return \App\Models\Order
     */
    public function execute(int $userId, string $address, array $items): Order
    {
        return DB::transaction(function () use ($userId, $address, $items): Order {
            // 1) Devis (prix lignes, remises, total)
            $quote = $this->pricing->quote($items);
            // 2) Vérifier & décrémenter le stock (avec lock)
            $this->stock->assertAndDecrement($items);

            // 3) Créer la commande
            $order = Order::create([
                'user_id'     => $userId,
                'total_cents' => $quote['total'],
                'status'      => 'EN_PREPARATION',
                'paid'        => false,
                'address'     => $address,
            ]);
            app(\App\Services\AuditService::class)->log(
                auth()->id(),
                'order.created',
                $order,
                ['before'=>null,'after'=>['id'=>$order->id,'total_cents'=>$order->total_cents,'status'=>$order->status]]
            );

            // 4) Créer les lignes
            foreach ($quote['lines'] as $line) {
                OrderItem::create($line + ['order_id' => $order->id]);
            }

            // 5) Émettre l'événement (listener : facture PDF + mail)
            event(new OrderCreated($order));
            $order = Order::create([/* ... */]);
// ...
            app(WebhookService::class)->dispatchEvent(
                DomainEvent::ORDER_CREATED,
                app(WebhookService::class)->orderPayload($order)
            );

            // 6) Retour avec relations utiles
            return $order->load(['items.product', 'deliveryUpdates', 'user']);
        });
    }
}

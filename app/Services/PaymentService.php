<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use App\Services\InvoiceService;
use Illuminate\Support\Facades\DB;
use App\Jobs\SendInvoiceJob;

class PaymentService
{
    public function __construct(private InvoiceService $invoiceService) {}

    /**
     * Marque une commande comme payée, enregistre le paiement et génère la facture.
     */
    public function capture(Order $order, int $amountCents, array $payload = [], string $provider = 'SIMULATED', ?string $reference = null): Payment
    {
        $order->update(['paid'=>true]);
        return DB::transaction(function () use ($order, $amountCents, $payload, $provider, $reference) {

            // si déjà payée, on ne double-paie pas
            if ($order->paid) {
                return $order->payments()->latest()->first() ?? Payment::create([
                    'order_id'=>$order->id,
                    'provider'=>$provider,
                    'reference'=>$reference,
                    'amount_cents'=>0,
                    'status'=>'SUCCEEDED',
                    'raw_payload'=>$payload,
                ]);
            }

            // vérif simple du montant
            if ($amountCents !== (int)$order->total_cents) {
                abort(422, 'Montant invalide : doit être égal au total de la commande');
            }

            // créer le paiement
            $payment = Payment::create([
                'order_id'     => $order->id,
                'provider'     => $provider,
                'reference'    => $reference,
                'amount_cents' => $amountCents,
                'status'       => 'SUCCEEDED',
                'raw_payload'  => $payload,
            ]);

            // marquer payé et générer facture
            $order->update(['paid'=>true]);
            app(WebhookService::class)->dispatchEvent(
                DomainEvent::ORDER_PAID,
                app(WebhookService::class)->orderPayload($order)
            );
            $this->invoiceService->generate($order->fresh(['items.product','user']));
            $this->invoiceService->generate($order->fresh(['items.product','user']));
            dispatch(new SendInvoiceJob($order->id));
            return $payment;
        });
    }
}

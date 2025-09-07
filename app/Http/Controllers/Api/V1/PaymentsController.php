<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class PaymentsController extends Controller
{
    /**
     * @OA\Post(
     *   path="/api/v1/orders/{order}/pay",
     *   summary="Payer une commande (simulation)",
     *   tags={"Payments"},
     *   @OA\Parameter(name="order", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK")
     * )
     */

    public function __construct()
    {
        $this->middleware('auth:sanctum')->only('payOrder');
    }

    /**
     * Paiement simulé par le client propriétaire de la commande.
     * POST /api/v1/orders/{order}/pay
     * body: { }
     */
    public function payOrder(Request $request, Order $order, PaymentService $svc)
    {
        $this->authorize('pay', $order);

        // montant = total de la commande
        $payment = $svc->capture($order, (int)$order->total_cents, [
            'initiator' => 'CLIENT',
            'ip' => $request->ip(),
            'ua' => $request->userAgent(),
        ], 'SIMULATED', 'SIM-'.now()->format('YmdHis').'-'.$order->id);

        return response()->json([
            'message' => 'Paiement réussi',
            'data' => [
                'payment' => $payment,
                'order'   => $order->fresh(['invoice']),
            ],
        ]);
    }

    /**
     * Webhook/callback simulé d’un prestataire de paiement.
     * POST /api/v1/payments/callback
     * headers: X-Payment-Secret: <PAYMENT_WEBHOOK_SECRET>
     * body: { "order_id": 123, "amount_cents": 2500, "reference":"EXT-12345" }
     */
    public function callback(Request $request, PaymentService $svc)
    {
        $secret = config('services.payments.webhook_secret');
        if (!$secret || $request->header('X-Payment-Secret') !== $secret) {
            return response()->json(['message'=>'Unauthorized'], 401);
        }

        $data = $request->validate([
            'order_id'     => 'required|integer|exists:orders,id',
            'amount_cents' => 'required|integer|min:0',
            'reference'    => 'nullable|string|max:190',
        ]);

        $order   = Order::findOrFail($data['order_id']);
        $payment = $svc->capture($order, (int)$data['amount_cents'], [
            'initiator' => 'WEBHOOK',
            'payload'   => $request->all(),
        ], 'WEBHOOK', $data['reference'] ?? null);

        return response()->json([
            'message' => 'Callback ok',
            'data' => [
                'payment' => $payment,
                'order'   => $order->fresh(['invoice']),
            ],
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\InvoiceService;

class InvoicesController extends Controller
{

    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Retourne le PDF de la facture pour une commande.
     * GET /api/v1/orders/{order}/invoice
     */
    /**
     * @OA\Get(
     *   path="/api/v1/orders/{id}/invoice",
     *   tags={"Invoices"},
     *   summary="Télécharger/voir la facture PDF",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="PDF stream"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=404, description="Not found")
     * )
     */

    public function show($orderId, InvoiceService $svc)
    {
        $order = Order::with(['items.product','user'])->findOrFail($orderId);
        $this->authorize('view', $order);

        $invoice = $svc->generate($order);

        $path = storage_path('app/public/'.$invoice->pdf_path);
        if (! file_exists($path)) {
            abort(404, 'Invoice file missing');
        }
        return response()->file($path, ['Content-Type' => 'application/pdf']);
    }
}

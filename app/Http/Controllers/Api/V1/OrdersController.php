<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\AddDeliveryUpdateAction;
use App\Actions\CreateOrderAction;
use App\Actions\UpdateOrderStatusAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Order\AddDeliveryUpdateRequest;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\UpdateStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\PricingService;
use Illuminate\Http\Request;

class OrdersController extends Controller
{
    /**
     * @OA\Post(
     *   path="/api/v1/orders",
     *   tags={"Orders"},
     *   summary="Créer une commande",
     *   security={{"sanctum":{}}},
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       required={"address","items"},
     *       @OA\Property(property="address", type="string"),
     *       @OA\Property(property="items", type="array", @OA\Items(
     *         @OA\Property(property="product_id", type="integer"),
     *         @OA\Property(property="qty", type="integer", minimum=1)
     *       ))
     *     )
     *   ),
     *   @OA\Response(response=200, description="OK", @OA\JsonContent(ref="#/components/schemas/Order")),
     *   @OA\Response(response=422, description="Validation error")
     * )
     *
     * @OA\Get(
     *   path="/api/v1/orders/mine",
     *   tags={"Orders"},
     *   summary="Mes commandes",
     *   security={{"sanctum":{}}},
     *   @OA\Response(
     *     response=200, description="OK",
     *     @OA\JsonContent(
     *       @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Order")),
     *       @OA\Property(property="meta", ref="#/components/schemas/ApiPagination")
     *     )
     *   )
     * )
     *
     * @OA\Get(
     *   path="/api/v1/orders/{id}",
     *   tags={"Orders"},
     *   summary="Détail d’une commande",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK", @OA\JsonContent(ref="#/components/schemas/Order")),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=404, description="Not found")
     * )
     *
     * @OA\Put(
     *   path="/api/v1/orders/{id}/status",
     *   tags={"Orders"},
     *   summary="(Employé/Admin) MAJ statut",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\RequestBody(
     *     @OA\JsonContent(
     *       required={"status"},
     *       @OA\Property(property="status", type="string", enum={"EN_PREPARATION","PRETE","EN_LIVRAISON","LIVREE"})
     *     )
     *   ),
     *   @OA\Response(response=200, description="OK", @OA\JsonContent(ref="#/components/schemas/Order")),
     *   @OA\Response(response=403, description="Forbidden")
     * )
     *
     * @OA\Post(
     *   path="/api/v1/orders/{id}/delivery-updates",
     *   tags={"Orders"},
     *   summary="(Employé/Admin) Ajout suivi livraison",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\RequestBody(
     *     @OA\JsonContent(
     *       required={"status"},
     *       @OA\Property(property="status", type="string"),
     *       @OA\Property(property="note", type="string", nullable=true)
     *     )
     *   ),
     *   @OA\Response(response=200, description="OK", @OA\JsonContent(ref="#/components/schemas/Order")),
     *   @OA\Response(response=403, description="Forbidden")
     * )
     */

    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function store(StoreOrderRequest $req, CreateOrderAction $action)
    {
        $v = $req->validated();
        $order = $action->execute($req->user()->id, $v['address'], $v['items']);
        return new OrderResource($order);
    }
    public function quote(\Illuminate\Http\Request $req, PricingService $pricing): \Illuminate\Http\JsonResponse
    {
        $data = $req->validate([
            'items' => ['required','array','min:1'],
            'items.*.product_id' => ['required','integer','exists:products,id'],
            'items.*.qty'        => ['required','integer','min:1'],
        ]);

        $quote = $pricing->quote($data['items']);
        return response()->json($quote);
    }

    public function mine(Request $req)
    {
        $orders = Order::with(['items.product','deliveryUpdates'])
            ->where('user_id', $req->user()->id)
            ->orderByDesc('id')
            ->paginate($req->integer('per_page', 12))
            ->withQueryString();

        return OrderResource::collection($orders);
    }

    public function show(Request $req, Order $order)
    {
        $this->authorize('view', $order);
        $order->load(['items.product','deliveryUpdates','user']);
        return new OrderResource($order);
    }

    public function updateStatus(UpdateStatusRequest $req, Order $order, UpdateOrderStatusAction $action)
    {
        $this->authorize('manage', $order);
        $order = $action->execute($order, $req->string('status'));
        return new \App\Http\Resources\OrderResource($order);
    }

    public function addDeliveryUpdate(AddDeliveryUpdateRequest $req, Order $order, AddDeliveryUpdateAction $action)
    {
        $this->authorize('manage', $order);
        $action->execute($order, $req->string('status'), $req->input('note'));
        return new \App\Http\Resources\OrderResource($order->fresh(['items.product','deliveryUpdates']));
    }
}

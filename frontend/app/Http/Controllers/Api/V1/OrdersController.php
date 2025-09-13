<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\AddDeliveryUpdateRequest;
use App\Http\Requests\Order\UpdateStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\PricingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Enums\OrderStatus;
use Illuminate\Support\Facades\Gate;

class OrdersController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum']);
    }

//    public function index(\Illuminate\Http\Request $req)
//    {
//        // staff only
//        $this->authorize('viewAny', \App\Models\Order::class); // OU Gate::authorize('manage-orders')
//
//        $per = $req->integer('per_page', 12);
//        $q = \App\Models\Order::with(['items.product','deliveryUpdates','user'])
//            ->orderByDesc('id')
//            ->paginate($per)->withQueryString();
//
//        return \App\Http\Resources\OrderResource::collection($q);
//    }

//    public function pay(Request $req, Order $order)
//    {
//        if ($order->paid) {
//            return new OrderResource($order);
//        }
//
//        $order->paid = true;
//        $order->save();
//
//        activity('orders')->performedOn($order)->log('order_paid_by_client');
//
//        return new OrderResource($order->fresh());
//    }
//
//    public function markPaid(Request $req, Order $order)
//    {
//        $this->authorize('manage', $order);
//
//        if (! $order->paid) {
//            $order->paid = true;
//            $order->save();
//            activity('orders')->performedOn($order)->log('order_marked_paid');
//        }
//
//        return new OrderResource($order);
//    }

    // app/Http/Controllers/Api/V1/OrdersController.php

    // app/Http/Controllers/Api/V1/OrdersController.php

    public function index(Request $req)
    {
        Gate::authorize('manage-orders'); // ✅ remplace authorize('manageAny', ...)

        $q = \App\Models\Order::query()
            ->with(['user','items.product'])
            ->when($req->filled('status'), fn($qq) => $qq->where('status', $req->string('status')))
            ->when($req->has('paid'), function ($qq) use ($req) {
                $paid = filter_var($req->input('paid'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                if ($paid === true)   $qq->whereNotNull('paid_at');
                elseif ($paid === false) $qq->whereNull('paid_at');
            })
            ->orderByDesc('id');

        $orders = $q->paginate($req->integer('per_page', 12))->withQueryString();

        return response()->json($orders); // tu pourras remettre OrderResource plus tard
    }


    // app/Http/Controllers/Api/V1/OrdersController.php

    public function store(Request $request)
    {
        try {
            // 1) Validation robuste
            $validated = $request->validate([
                'address' => ['nullable', 'string', 'max:500'],
                'items' => ['required', 'array', 'min:1'],
                'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
                // autoriser qty OU quantity
                'items.*.qty' => ['nullable', 'integer', 'min:1'],
                'items.*.quantity' => ['nullable', 'integer', 'min:1'],
            ]);

            // 2) Normalisation des lignes
            $rawItems = $validated['items'];
            $normItems = [];
            foreach ($rawItems as $i => $line) {
                $pid = (int)($line['product_id'] ?? 0);
                $qty = (int)($line['qty'] ?? $line['quantity'] ?? 0);
                if ($pid <= 0 || $qty <= 0) {
                    return response()->json([
                        'message' => 'Ligne invalide',
                        'errors' => ["items.$i" => ['product_id/qty manquant ou invalide']]
                    ], 422);
                }
                $normItems[] = ['product_id' => $pid, 'qty' => $qty];
            }

            if (empty($normItems)) {
                return response()->json(['message' => 'Aucun article'], 422);
            }

            // 3) Rechargement produits + calcul
            $productIds = collect($normItems)->pluck('product_id')->all();
            $products = \App\Models\Product::whereIn('id', $productIds)->get()->keyBy('id');

            $totalCents = 0;
            $lines = [];
            foreach ($normItems as $i => $it) {
                $p = $products[$it['product_id']] ?? null;
                if (!$p) {
                    return response()->json([
                        'message' => "Produit introuvable",
                        'errors' => ["items.$i.product_id" => ['inexistant']]
                    ], 422);
                }
                $unit = (int)($p->price_cents ?? 0);
                $qty = (int)$it['qty'];
                $lineTotal = $unit * $qty;
                $totalCents += $lineTotal;

                $lines[] = [
                    'product_id' => $p->id,
                    'unit_price_cents' => $unit,
                    'qty' => $qty,
                    'total_cents' => $lineTotal,
                ];
            }

            // 4) Création (transaction conseillée)

            // use App\Enums\OrderStatus; // déjà présent

            return \DB::transaction(function () use ($request, $validated, $lines, $totalCents) {

                // ⛔️ Désactive logging
                activity()->disableLogging();

                $order = \App\Models\Order::create([
                    'user_id'     => $request->user()->id,
                    'status'      => \App\Enums\OrderStatus::EN_PREPARATION,
                    'address'     => $validated['address'] ?? null,
                    'total_cents' => $totalCents,
                ]);

                foreach ($lines as $l) {
                    $payload = [
                        'order_id'         => $order->id,
                        'product_id'       => $l['product_id'],
                        'unit_price_cents' => $l['unit_price_cents'],
                    ];

                    // adapte aux colonnes existantes
                    if (\Schema::hasColumn('order_items','qty')) {
                        $payload['qty'] = $l['qty'];
                    } elseif (\Schema::hasColumn('order_items','quantity')) {
                        $payload['quantity'] = $l['qty'];
                    } else {
                        $payload['qty'] = $l['qty'];
                    }

                    if (\Schema::hasColumn('order_items','line_total_cents')) {
                        $payload['line_total_cents'] = $l['total_cents'];
                    } elseif (\Schema::hasColumn('order_items','total_cents')) {
                        $payload['total_cents'] = $l['total_cents'];
                    }

                    if (\Schema::hasColumn('order_items','product_name')) {
                        $p = \App\Models\Product::find($l['product_id']);
                        $payload['product_name'] = $p?->name ?? '';
                    }

                    // insertion silencieuse
                    $order->items()->getModel()->fill($payload)->saveQuietly();
                }

                // ✅ Réactive logging après
                activity()->enableLogging();

                return response()->json([
                    'data' => [
                        'id'          => $order->id,
                        'status'      => $order->status,
                        'total_cents' => $order->total_cents,
                    ]
                ], 201);
            });

        } catch (\Throwable $e) {
            \Log::error('ORDER_STORE_500: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);

            if (app()->environment('local')) {
                return response()->json([
                    'message' => 'Erreur serveur lors de la création de la commande.',
                    'debug'   => $e->getMessage(),
                ], 500);
            }

            return response()->json(['message' => 'Erreur serveur lors de la création de la commande.'], 500);
        }
    }


    public function quote(Request $req, PricingService $pricing)
    {
        $data = $req->validate([
            'items'               => ['required','array','min:1'],
            'items.*.product_id'  => ['required','integer','exists:products,id'],
            'items.*.qty'         => ['required','integer','min:1'],
        ]);

        $quote = $pricing->quote($data['items']);
        return response()->json($quote);
    }
    public function mine(Request $req)
    {
        $orders = \App\Models\Order::with(['items.product'])
            ->where('user_id', $req->user()->id)
            ->orderByDesc('id')
            ->paginate($req->integer('per_page', 12))
            ->withQueryString();

        return \App\Http\Resources\OrderResource::collection($orders);
    }

//    public function show(Request $req, \App\Models\Order $order)
//    {
//        $this->authorize('view', $order);
//
//        // Ne charge plus deliveryUpdates ici
//        $order->load(['items.product','user']);
//
//        return new \App\Http\Resources\OrderResource($order);
//    }




    // OK tel que tu l’as envoyé
    public function show(Request $req, Order $order)
    {
        $this->authorize('view', $order);
        $order->load(['items.product','user']); // ⬅️ PAS de deliveryUpdates ici
        return new \App\Http\Resources\OrderResource($order);
    }


    public function pay(Request $req, Order $order)
    {
        if ($order->paid_at) {
            return new OrderResource($order);
        }

        $order->paid_at = now();
        $order->save();

        try { if (function_exists('activity')) {
            activity('orders')->performedOn($order)->log('order_paid_by_client');
        }} catch (\Throwable $e) {}

        return new OrderResource($order->fresh(['items.product','user']));
    }

    // app/Http/Controllers/Api/V1/OrdersController.php

    public function markPaid(Request $req, Order $order)
    {
        // Autorisation (staff)
        $this->authorize('manage', $order);

        \Log::info('[markPaid] start', [
            'order_id' => $order->id,
            'user_id'  => $req->user()->id,
            'role'     => (string)$req->user()->role,
        ]);

        // Construire les changements sans casser si la colonne "paid" n'existe pas
        $changes = [];

        // Si la colonne "paid" existe ET que ce n’est pas déjà payé, on la met à true
        if (\Schema::hasColumn('orders', 'paid')) {
            if (! (bool) $order->getAttribute('paid')) {
                $changes['paid'] = true;
            }
        }

        // Toujours poser paid_at s’il est null
        if ($order->paid_at === null) {
            $changes['paid_at'] = now();
        }


        if (!empty($changes)) {
            $order->fill($changes)->save();

            try {
                if (function_exists('activity')) {
                    activity('orders')->performedOn($order)->log('order_marked_paid');
                }
            } catch (\Throwable $e) {
                \Log::warning('activitylog_failed_in_markPaid: '.$e->getMessage());
            }
        }


        return new \App\Http\Resources\OrderResource(
            $order->fresh(['items.product','user'])
        );
    }




    public function addDeliveryUpdate(AddDeliveryUpdateRequest $req, Order $order, \App\Actions\AddDeliveryUpdateAction $action)
    {
        $this->authorize('manage', $order);
        $action->execute($order, $req->string('status'), $req->input('note'));
        return new OrderResource($order->fresh(['items.product','deliveryUpdates']));
    }
}

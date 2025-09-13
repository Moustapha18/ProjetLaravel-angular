<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    /**
     * @OA\Get(
     *   path="/api/v1/admin/stats",
     *   tags={"Admin/Stats"},
     *   summary="KPIs & top produits sur une période",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="start", in="query", @OA\Schema(type="string", format="date")),
     *   @OA\Parameter(name="end",   in="query", @OA\Schema(type="string", format="date")),
     *   @OA\Response(response=200, description="OK")
     * )
     */

    public function index(Request $r)
    {
        // période optionnelle ?start=YYYY-MM-DD&end=YYYY-MM-DD
        $start = $r->date('start', now()->startOfMonth());
        $end   = $r->date('end', now());

        $totals = [
            'users'        => User::count(),
            'products'     => Product::count(),
            'orders'       => Order::count(),
            'orders_paid'  => Order::where('paid', true)->count(),
            'revenue_cfa'  => Order::whereBetween('created_at', [$start, $end])->sum('total_cents'),
        ];

        // top 5 produits par CA ligne
        $top = DB::table('order_items')
            ->join('products','products.id','=','order_items.product_id')
            ->select('products.id','products.name', DB::raw('SUM(order_items.line_total_cents) as revenue'))
            ->groupBy('products.id','products.name')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get();

        // répartition statuts
        $status = Order::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        return response()->json([
            'data' => [
                'totals' => $totals,
                'status_breakdown' => $status,
                'top_products' => $top,
                'period' => ['start'=>$start->toDateString(),'end'=>$end->toDateString()],
            ],
        ]);
    }
}

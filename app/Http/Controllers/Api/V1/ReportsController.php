<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class ReportsController extends Controller
{
    public function sales(Request $r)
    {
        $from = $r->date('from', now()->startOfMonth());
        $to   = $r->date('to',   now());

        $q = Order::query()->whereBetween('created_at',[$from,$to]);
        $totalOrders = (clone $q)->count();
        $totalCents  = (clone $q)->sum('total_cents');

        return response()->json([
            'data'=>[
                'from'=>$from->toDateString(),
                'to'=>$to->toDateString(),
                'total_orders'=>$totalOrders,
                'total_cents'=>$totalCents,
            ]
        ]);
    }
}

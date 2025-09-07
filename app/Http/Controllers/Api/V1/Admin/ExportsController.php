<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Http\Request;

class ExportsController extends Controller
{
    public function products(Request $r): StreamedResponse
    {
        // filtres optionnels
        $q = Product::query()->with('category');

        if ($cat = $r->query('category_id')) {
            $q->where('category_id', $cat);
        }
        if ($s = $r->query('search')) {
            $q->where(function($qq) use ($s){
                $qq->where('name','like',"%$s%")->orWhere('description','like',"%$s%");
            });
        }

        $q->orderBy('id');

        $filename = 'products-'.now()->format('Ymd_His').'.csv';

        return response()->streamDownload(function () use ($q) {
            $out = fopen('php://output', 'w');
            // en-têtes
            fputcsv($out, ['id','category','name','price_cents','stock','slug','created_at']);

            $q->chunk(100, function ($rows) use ($out) {
                foreach ($rows as $p) {
                    fputcsv($out, [
                        $p->id,
                        optional($p->category)->name,
                        $p->name,
                        $p->price_cents,
                        $p->stock,
                        $p->slug,
                        optional($p->created_at)?->toDateTimeString(),
                    ]);
                }
            });
            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function orders(Request $r): StreamedResponse
    {
        // filtres: date_from, date_to, status, paid
        $q = Order::query()->with(['user','items.product'])
            ->when($r->filled('status'), fn($qq)=>$qq->where('status', $r->string('status')))
            ->when($r->filled('paid'), fn($qq)=>$qq->where('paid', filter_var($r->query('paid'), FILTER_VALIDATE_BOOLEAN)))
            ->when($r->filled('date_from'), fn($qq)=>$qq->whereDate('created_at','>=', $r->date('date_from')))
            ->when($r->filled('date_to'), fn($qq)=>$qq->whereDate('created_at','<=', $r->date('date_to')))
            ->orderBy('id');

        $filename = 'orders-'.now()->format('Ymd_His').'.csv';

        return response()->streamDownload(function () use ($q) {
            $out = fopen('php://output', 'w');
            // en-têtes
            fputcsv($out, [
                'order_id','created_at','client_email','status','paid','address','total_cents',
                'items_count','items_detail'
            ]);

            $q->chunk(100, function ($rows) use ($out) {
                foreach ($rows as $o) {
                    // détail items "qty x product (unit:price)"
                    $items = $o->items->map(function($it){
                        return "{$it->qty}x {$it->product->name} (unit:{$it->unit_price_cents}, line:{$it->line_total_cents})";
                    })->implode(' | ');

                    fputcsv($out, [
                        $o->id,
                        optional($o->created_at)?->toDateTimeString(),
                        optional($o->user)->email,
                        is_string($o->status) ? $o->status : $o->status->value, // enum-safe
                        $o->paid ? '1' : '0',
                        $o->address,
                        $o->total_cents,
                        $o->items->count(),
                        $items,
                    ]);
                }
            });
            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Exports\OrdersExport;
use App\Exports\ProductsExport;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ExportsController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum','can:admin']);
    }

    // GET /api/v1/exports/products?format=csv|xlsx&category_id=...
    public function products(Request $r)
    {
        $format = strtolower($r->query('format','csv'));
        $file   = 'products_'.now()->format('Ymd_His').'.'.$format;
        $export = new ProductsExport($r->integer('category_id'));

        return match($format) {
            'xlsx' => Excel::download($export, $file, \Maatwebsite\Excel\Excel::XLSX),
            default => Excel::download($export, $file, \Maatwebsite\Excel\Excel::CSV),
        };
    }

    // GET /api/v1/exports/orders?format=csv|xlsx&status=...
    public function orders(Request $r)
    {
        $format = strtolower($r->query('format','csv'));
        $file   = 'orders_'.now()->format('Ymd_His').'.'.$format;
        $export = new OrdersExport($r->query('status'));

        return match($format) {
            'xlsx' => Excel::download($export, $file, \Maatwebsite\Excel\Excel::XLSX),
            default => Excel::download($export, $file, \Maatwebsite\Excel\Excel::CSV),
        };
    }
}

<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $r)
    {
        $q = Activity::query()
            ->when($r->filled('log'), fn($qq)=>$qq->where('log_name', $r->string('log')))
            ->when($r->filled('event'), fn($qq)=>$qq->where('event', $r->string('event')))
            ->when($r->filled('user_id'), fn($qq)=>$qq->where('causer_id', $r->integer('user_id')))
            ->when($r->filled('date_from'), fn($qq)=>$qq->whereDate('created_at','>=',$r->date('date_from')))
            ->when($r->filled('date_to'), fn($qq)=>$qq->whereDate('created_at','<=',$r->date('date_to')))
            ->orderByDesc('id');

        $per = min(max((int)$r->query('per_page', 20), 1), 100);
        $logs = $q->paginate($per)->withQueryString();

        return response()->json([
            'data' => $logs->items(),
            'meta' => [
                'total'=>$logs->total(),
                'current_page'=>$logs->currentPage(),
                'per_page'=>$logs->perPage(),
            ],
        ]);
    }
}

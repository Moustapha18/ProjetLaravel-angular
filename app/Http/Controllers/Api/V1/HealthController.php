<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function __invoke()
    {
        $db = false;
        try { DB::select('select 1'); $db = true; } catch (\Throwable) {}

        $cache = false;
        try { Cache::put('health', 'ok', 5); $cache = Cache::get('health') === 'ok'; } catch (\Throwable) {}

        return response()->json([
            'ok'    => $db && $cache,
            'db'    => $db,
            'cache' => $cache,
            'time'  => now()->toIso8601String(),
        ]);
    }
}

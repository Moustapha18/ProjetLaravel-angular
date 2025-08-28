<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\WebhookEndpoint;
use Illuminate\Http\Request;

class WebhooksController extends Controller
{
    public function __construct() {
        $this->middleware(['auth:sanctum','can:admin']);
    }

    public function index() {
        return response()->json(['data'=>WebhookEndpoint::orderByDesc('id')->get()]);
    }

    public function store(Request $r) {
        $data = $r->validate([
            'url'       => ['required','url','max:2000'],
            'secret'    => ['required','string','max:255'],
            'events'    => ['required','array','min:1'],
            'events.*'  => ['string'],
            'is_active' => ['boolean'],
        ]);
        $ep = WebhookEndpoint::create($data + ['is_active'=>$data['is_active'] ?? true]);
        return response()->json(['data'=>$ep], 201);
    }

    public function show(WebhookEndpoint $webhook) {
        return response()->json(['data'=>$webhook]);
    }

    public function update(Request $r, WebhookEndpoint $webhook) {
        $data = $r->validate([
            'url'       => ['sometimes','url','max:2000'],
            'secret'    => ['sometimes','string','max:255'],
            'events'    => ['sometimes','array','min:1'],
            'events.*'  => ['string'],
            'is_active' => ['sometimes','boolean'],
        ]);
        $webhook->update($data);
        return response()->json(['data'=>$webhook]);
    }

    public function destroy(WebhookEndpoint $webhook) {
        $webhook->delete();
        return response()->json(['ok'=>true]);
    }
}

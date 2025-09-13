<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebhookDelivery extends Model
{
    protected $fillable = [
        'webhook_endpoint_id','event','payload','attempts','max_attempts','status_code','error','sent_at'
    ];
    protected $casts = [
        'payload' => 'array',
        'sent_at' => 'datetime',
    ];

    public function endpoint() {
        return $this->belongsTo(WebhookEndpoint::class,'webhook_endpoint_id');
    }
}

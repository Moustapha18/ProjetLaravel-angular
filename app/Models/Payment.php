<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'order_id','provider','reference','amount_cents','status','raw_payload'
    ];

    protected $casts = ['raw_payload'=>'array'];

    public function order(){ return $this->belongsTo(Order::class); }
}

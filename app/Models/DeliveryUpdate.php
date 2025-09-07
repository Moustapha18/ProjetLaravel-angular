<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DeliveryUpdate extends Model
{
    use HasFactory;
    use SoftDeletes;

    // Laisse tout ouvert pour éviter les soucis de mass assignment pendant le debug
    protected $guarded = [];

    // Si ta table a bien created_at/updated_at, garde true (par défaut).
    // Mets `public $timestamps = false;` si ta table n’a pas ces colonnes.
    // public $timestamps = true;

    public function order()
    {
        return $this->belongsTo(\App\Models\Order::class);
    }
}

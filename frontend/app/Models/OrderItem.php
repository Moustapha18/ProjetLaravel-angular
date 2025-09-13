<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class OrderItem extends Model {
    use HasFactory;
    protected $fillable = [
        'order_id','product_id','unit_price_cents','qty','line_total_cents'
    ];
// (retire 'product_name' ici pour rester cohérent)
    public function order(){ return $this->belongsTo(Order::class); }
    public function product(){ return $this->belongsTo(Product::class); }
    protected $guarded = [];
    // ou:
    // protected $fillable = ['order_id','product_id','qty','unit_price_cents','line_total_cents'];

    public $timestamps = false; // si ta table n a pas created_at/updated_at



    //public function order(){ return $this->belongsTo(Order::class); }
   // public function product(){ return $this->belongsTo(Product::class); }
}


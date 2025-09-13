<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
// use Illuminate\Database\Eloquent\SoftDeletes; // si tu l'utilises

class Product extends Model
{
    // use SoftDeletes; // si tu l’utilises

    // app/Models/Product.php

    protected $appends = ['image_url','price_fr'];

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path ? asset('storage/'.$this->image_path) : null;
    }

    public function getPriceFrAttribute(): string
    {
        return number_format((int)($this->price_cents ?? 0), 0, ',', ' ');
    }

    protected $fillable = [
        'name','slug','price_cents','description','stock','percent_off','category_id','image_path',
    ];

    protected $casts = [
        'price_cents' => 'integer',
        'category_id' => 'integer',
        'stock'       => 'integer',
        'percent_off' => 'integer',
    ];


    public function category()
{
    return $this->belongsTo(Category::class);
}
}

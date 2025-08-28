<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Product extends Model {
    use HasFactory;
    use SoftDeletes;
    use LogsActivity;

    protected $fillable=['category_id','name','slug','price_cents','stock','image_path','description'];
    public function category(){ return $this->belongsTo(Category::class); }
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('products')
            ->logFillable()           // ou ->logOnly(['name','price_cents','stock','category_id','description','image_path'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}


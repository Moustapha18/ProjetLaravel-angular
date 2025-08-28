<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; // ← AJOUTE ÇA
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Category extends Model
{
    use HasFactory; // ← AJOUTE ÇA
    use SoftDeletes;
    protected $fillable = ['name','slug'];

    public function products(){ return $this->hasMany(Product::class); }
    use LogsActivity;
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('categories')
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

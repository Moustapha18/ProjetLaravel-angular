<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Promotion extends Model
{
    use HasFactory;

    protected $fillable = [
        'type','value','scope','scope_id','starts_at','ends_at','is_active',
    ];
    use LogsActivity;
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('promotions')
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
    protected $casts = [
        'is_active' => 'bool',
        'starts_at' => 'datetime',
        'ends_at'   => 'datetime',
    ];

    public function scopeActive($q)
    {
        return $q->where('is_active', true)
            ->where(function($qq){
                $qq->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function($qq){
                $qq->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            });
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\OrderStatus;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Order extends Model {
    use HasFactory;
    use LogsActivity;
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('orders')
            ->logOnly(['status','paid','address','total_cents']) // évite de loguer trop
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
    public function payments(){ return $this->hasMany(\App\Models\Payment::class); }

    protected $fillable=['user_id','total_cents','status','paid','address'];
    protected $casts=['status'=>OrderStatus::class,'paid'=>'bool'];
    public function user(){ return $this->belongsTo(User::class); }
    public function items(){ return $this->hasMany(OrderItem::class); }
    public function deliveryUpdates(){ return $this->hasMany(DeliveryUpdate::class); }
    public function invoice(){ return $this->hasOne(Invoice::class); }
    public function scopeMine($q,$user){ return $q->where('user_id',$user->id); }
}


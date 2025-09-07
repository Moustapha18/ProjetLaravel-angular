<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    public $timestamps = false; // on gère que created_at
    protected $fillable = ['subject_type','subject_id','user_id','action','changes','ip','user_agent','method','path','created_at'];
    protected $casts = ['changes'=>'array', 'created_at'=>'datetime'];

    public function subject() { return $this->morphTo(); }
    public function user()    { return $this->belongsTo(User::class); }
}

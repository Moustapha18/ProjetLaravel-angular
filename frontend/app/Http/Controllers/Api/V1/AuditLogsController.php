<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogsController extends Controller
{
    public function __construct() {
        $this->middleware(['auth:sanctum','can:admin']);
    }

    public function index(Request $r)
    {
        $q = AuditLog::query()->with(['user']);

        if ($r->filled('action'))        $q->where('action', $r->string('action'));
        if ($r->filled('user_id'))       $q->where('user_id', $r->integer('user_id'));
        if ($r->filled('subject_type'))  $q->where('subject_type', $r->string('subject_type'));
        if ($r->filled('subject_id'))    $q->where('subject_id', $r->integer('subject_id'));
        if ($r->filled('from'))          $q->where('created_at','>=', $r->date('from'));
        if ($r->filled('to'))            $q->where('created_at','<=', $r->date('to'));

        $q->orderByDesc('id');

        $per = min(max((int)$r->query('per_page', 20), 1), 100);
        return response()->json($q->paginate($per)->withQueryString());
    }

    public function show(AuditLog $auditLog)
    {
        $auditLog->load('user');
        return response()->json(['data'=>$auditLog]);
    }
}

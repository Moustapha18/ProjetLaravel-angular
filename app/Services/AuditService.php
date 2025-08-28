<?php
namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

class AuditService
{
    public function log(?int $userId, string $action, ?Model $subject = null, ?array $changes = null): void
    {
        $req = request();

        AuditLog::create([
            'subject_type' => $subject?->getMorphClass(),
            'subject_id'   => $subject?->getKey(),
            'user_id'      => $userId,
            'action'       => $action,
            'changes'      => $changes,
            'ip'           => $req?->ip(),
            'user_agent'   => substr((string)$req?->userAgent(), 0, 1024),
            'method'       => $req?->method(),
            'path'         => $req?->path(),
            'created_at'   => now(),
        ]);
    }

    /**
     * Construit un diff simple "before/after" à partir d’un modèle modifié.
     * $fields = champs à suivre, sinon on prend dirty + original.
     */
    public function diff(Model $model, ?array $fields = null): array
    {
        $before = [];
        $after  = [];

        $dirty = $fields ? array_intersect_key($model->getDirty(), array_flip($fields))
            : $model->getDirty();

        foreach ($dirty as $k => $v) {
            $before[$k] = $model->getOriginal($k);
            $after[$k]  = $model->{$k};
        }

        return ['before'=>$before, 'after'=>$after];
    }
}

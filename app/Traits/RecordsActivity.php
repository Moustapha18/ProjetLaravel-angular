<?php
namespace App\Traits;

use App\Services\AuditService;

trait RecordsActivity
{
    // À appeler dans les Observers ou Controller après action
    protected function audit(string $action, ?array $changes = null): void
    {
        /** @var \Illuminate\Contracts\Auth\Authenticatable|null $u */
        $u = auth()->user();
        app(AuditService::class)->log($u?->id, $action, $this, $changes);
    }
}

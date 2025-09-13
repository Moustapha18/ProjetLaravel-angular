<?php

namespace App\Console\Commands;

use App\Models\Promotion;
use Illuminate\Console\Command;

class SyncPromotionsStatus extends Command
{
    protected $signature = 'promotions:sync';
    protected $description = 'Active/désactive les promotions selon leurs dates starts_at/ends_at';

    public function handle(): int
    {
        $now = now();

        // Désactiver celles expirées (ends_at < now)
        $expired = Promotion::query()
            ->where('is_active', true)
            ->whereNotNull('ends_at')
            ->where('ends_at', '<', $now)
            ->update(['is_active' => false]);

        // Activer celles qui commencent (starts_at <= now) et pas expirées
        $activated = Promotion::query()
            ->where('is_active', false)
            ->where(function ($q) use ($now) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
            })
            ->update(['is_active' => true]);

        $this->info("Promotions expirées désactivées : {$expired}");
        $this->info("Promotions activées : {$activated}");

        return self::SUCCESS;
    }
}

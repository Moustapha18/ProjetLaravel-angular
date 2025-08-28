<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

class CacheVersion
{
    // retourne la version actuelle (par ex. v:products => 5)
    public static function get(string $group): int
    {
        return (int) Cache::get(self::vk($group), 1);
    }

    // incrémente la version => invalide logiquement toutes les clés versionnées
    public static function bump(string $group): void
    {
        $vk = self::vk($group);
        $current = (int) Cache::get($vk, 1);
        Cache::forever($vk, $current + 1);
    }

    // génère une clé versionnée et stable pour une requête
    public static function key(string $group, array $parts): string
    {
        $v = self::get($group);
        ksort($parts);
        return sprintf('v%s:%s:%s', $v, $group, md5(json_encode($parts)));
    }

    private static function vk(string $group): string
    {
        return "vkey:{$group}";
    }
}

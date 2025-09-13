<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SimpleCors
{
    public function handle(Request $request, Closure $next): Response
    {
        $origin  = $request->headers->get('Origin');
        $allowed = ['http://localhost:4200', 'http://127.0.0.1:4200'];

        // Répondre directement au préflight
        if ($request->getMethod() === 'OPTIONS') {
            $resp = response('', 204);
            return $this->addHeaders($resp, $origin, $allowed);
        }

        /** @var \Symfony\Component\HttpFoundation\Response $resp */
        $resp = $next($request);
        return $this->addHeaders($resp, $origin, $allowed);
    }

    private function addHeaders(Response $resp, ?string $origin, array $allowed): Response
    {
        if ($origin && in_array($origin, $allowed, true)) {
            $resp->headers->set('Access-Control-Allow-Origin', $origin);
        }
        $resp->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $resp->headers->set('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With, Accept, Origin');
        $resp->headers->set('Access-Control-Max-Age', '86400'); // 24h
        // En Bearer token, PAS besoin des credentials
        return $resp;
    }
}

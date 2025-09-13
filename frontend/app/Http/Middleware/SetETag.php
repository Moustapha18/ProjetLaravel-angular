<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SetETag
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next)
    {
        /** @var \Illuminate\Http\Response|\Illuminate\Http\JsonResponse $response */
        $response = $next($request);

        // Seulement pour les GET réussis (200, 201…)
        if ($request->isMethod('GET') && $response->isSuccessful() && !$response->headers->has('ETag')) {
            $etag = sha1($response->getContent());
            $response->headers->set('ETag', $etag);

            $ifNoneMatch = $request->headers->get('If-None-Match');
            if ($ifNoneMatch && trim($ifNoneMatch, '"') === $etag) {
                $response->setNotModified();
            }
        }

        return $response;
    }
}

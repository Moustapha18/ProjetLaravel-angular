<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class Handler extends ExceptionHandler
{

    public function register(): void
    {
        $this->renderable(function (\Throwable $e, $request) {
            if ($request->is('api/*')) {
                $code = method_exists($e,'getStatusCode') ? $e->getStatusCode() : 500;
                $payload = ['message'=>$e->getMessage()];
                if ($e instanceof \Illuminate\Validation\ValidationException) {
                    $payload['errors'] = $e->errors();
                    $code = 422;
                }
                if (config('app.debug')) {
                    $payload['exception'] = class_basename($e);
                }
                return response()->json($payload, $code);
            }
        });
    }
    public function render($request, Throwable $e)
    {
        if ($request->expectsJson()) {
            // Validation
            if ($e instanceof ValidationException) {
                return response()->json([
                    'error' => [
                        'type' => 'validation',
                        'message' => 'Invalid data.',
                        'details' => $e->errors(),
                    ],
                ], 422);
            }

            // 4xx/5xx
            $status = $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;

            return response()->json([
                'error' => [
                    'type'    => class_basename($e),
                    'message' => $e->getMessage() ?: 'Server Error',
                ],
            ], $status);
        }

        return parent::render($request, $e);
    }
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */

}

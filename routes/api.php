<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\{
    HealthController,
    AuthController,
    PaymentsController,
    ProductsController,
    CategoriesController,
    PromotionsController,
    OrdersController,
    InvoicesController,
    ReportsController,
    AuditLogsController,
    WebhooksController
};
use App\Http\Controllers\Api\V1\Admin\{
    ActivityLogController,
    ExportsController,
    StatsController,
    TrashController
};

Route::prefix('v1')->group(function () {
    // ---------- Public ----------
    Route::get('/health', HealthController::class);

    Route::get('/categories', [CategoriesController::class, 'index']);
    Route::get('/products',   [ProductsController::class, 'index']);
    Route::get('/products/{product}', [ProductsController::class, 'show']);

    // Devis (publique si tu le veux)
    Route::post('/orders/quote', [OrdersController::class, 'quote'])->middleware('throttle:orders');

    // Webhook paiement (public, vérifié par signature)
    Route::post('/payments/callback', [PaymentsController::class, 'callback'])->middleware('throttle:orders');

    // ---------- Protégé (auth) ----------
    Route::middleware('auth:sanctum')->group(function () {
        // Profil
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);

        // Commandes (client)
        Route::post('/orders',                [OrdersController::class, 'store'])->middleware('throttle:orders');
        Route::get('/orders/mine',            [OrdersController::class, 'mine']);
        Route::get('/orders/{order}',         [OrdersController::class, 'show']);
        Route::get('/orders/{order}/invoice', [InvoicesController::class, 'show']);

        // Gestion commandes (employé/admin)
        Route::middleware('can:manage-orders')->group(function () {
            Route::put('/orders/{order}/status',            [OrdersController::class, 'updateStatus']);
            Route::post('/orders/{order}/delivery-updates', [OrdersController::class, 'addDeliveryUpdate']);
        });

        // ---------- Admin ----------
        Route::middleware(['can:admin','throttle:admin'])->group(function () {
            // CRUD admin
            Route::apiResource('categories', CategoriesController::class)->except(['index','show']);
            Route::apiResource('products',   ProductsController::class)->except(['index','show']);
            Route::apiResource('promotions', PromotionsController::class);

            // Upload image produit
            Route::post('/products/{product}/image',  [ProductsController::class, 'uploadImage']);
            Route::delete('/products/{product}/image',[ProductsController::class, 'deleteImage']);

            // Exports / Stats / Logs / Reports / Trash
            Route::get('/exports/products', [ExportsController::class, 'products']);
            Route::get('/exports/orders',   [ExportsController::class, 'orders']);
            Route::get('/admin/stats',      [StatsController::class, 'index']);

            Route::get('/activity-logs',        [ActivityLogController::class, 'index']);
            Route::get('/audit-logs',           [AuditLogsController::class, 'index']);
            Route::get('/audit-logs/{auditLog}',[AuditLogsController::class, 'show']);
            Route::get('/reports/sales',        [ReportsController::class, 'sales']);

            Route::get('/trash/{type}',                    [TrashController::class, 'index']);
            Route::post('/trash/{type}/{id}/restore',      [TrashController::class, 'restore']);
            Route::delete('/trash/{type}/{id}',            [TrashController::class, 'forceDelete']);

            // Webhooks (admin CRUD)
            Route::apiResource('webhooks', WebhooksController::class);
        });
    });
});

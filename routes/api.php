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
    TrashController,
    UsersController,
    ProductsAdminController,
    CategoriesAdminController
};

Route::prefix('v1')->group(function () {

    // ============
    // Public
    // ============
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);
    Route::get('health',     HealthController::class);

    // Catalogue public (lecture)
    Route::get('categories',               [CategoriesController::class, 'index']);
    Route::get('products',                 [ProductsController::class, 'index']);
    Route::get('products/{product}',       [ProductsController::class, 'show']);

    // Devis (peut rester public si voulu)
    Route::post('orders/quote', [OrdersController::class, 'quote'])->middleware('throttle:orders');

    // ============
    // Protégé
    // ============
    Route::middleware('auth:sanctum')->group(function () {

        // Profil / session
        Route::get('me',            [AuthController::class, 'me']);
        Route::post('logout',       [AuthController::class, 'logout']);
        Route::post('me/password',  [AuthController::class, 'updatePassword']);

        // Paiement d'une commande par le client (policy view)
        Route::post('orders/{order}/pay', [OrdersController::class, 'pay'])->middleware('can:view,order');

        // Commandes (client connecté)
        Route::post('orders',                [OrdersController::class, 'store'])->middleware('throttle:orders');
        Route::get('orders/mine',            [OrdersController::class, 'mine']);
        Route::get('orders/{order}',         [OrdersController::class, 'show']);
        Route::get('orders/{order}/invoice', [InvoicesController::class, 'show']);

        // Gestion commandes (employé/admin)
        Route::middleware('can:manage-orders')->group(function () {
            Route::get('orders',                                [OrdersController::class, 'index']);
            Route::put('orders/{order}/status',                 [OrdersController::class, 'updateStatus']);
            Route::post('orders/{order}/delivery-updates',      [OrdersController::class, 'addDeliveryUpdate']);
            Route::post('orders/{order}/mark-paid',             [OrdersController::class, 'markPaid']);
        });

        // ==============
        // STAFF (Admin + Employé) : gestion catalogue
        // ==============
        Route::middleware('can:manage-catalog')
            ->prefix('admin')
            ->group(function () {

                // Catégories (CRUD staff)
                Route::get   ('categories',                 [CategoriesAdminController::class, 'index']);
                Route::post  ('categories',                 [CategoriesAdminController::class, 'store']);
                Route::get   ('categories/{category}',      [CategoriesAdminController::class, 'show']);
                Route::put   ('categories/{category}',      [CategoriesAdminController::class, 'update']);
                Route::delete('categories/{category}',      [CategoriesAdminController::class, 'destroy']);

                // Produits (CRUD staff) + image
                Route::post   ('products',                  [ProductsAdminController::class, 'store']);
                Route::put    ('products/{product}',        [ProductsAdminController::class, 'update']);
                Route::delete ('products/{product}',        [ProductsAdminController::class, 'destroy']);
                Route::post   ('products/{product}/image',  [ProductsAdminController::class, 'uploadImage'])->name('admin.products.image.upload');
                Route::delete ('products/{product}/image',  [ProductsAdminController::class, 'deleteImage']);
            });

        // ==============
        // ADMIN only
        // ==============
        Route::middleware(['can:admin','throttle:admin'])->group(function () {

            // Gestion des utilisateurs (admin)
            Route::prefix('admin')->group(function () {
                Route::get   ('users',                         [UsersController::class, 'index']);
                Route::post  ('users',                         [UsersController::class, 'store']);
                Route::get   ('users/{user}',                  [UsersController::class, 'show']);
                Route::put   ('users/{user}',                  [UsersController::class, 'update']);
                Route::delete('users/{user}',                  [UsersController::class, 'destroy']);
                Route::post  ('users/{user}/reset-password',   [UsersController::class, 'resetPassword']);

                // Stats / exports / logs / reports / trash / webhooks
                Route::get('stats',                [StatsController::class, 'index']);
                Route::get('exports/products',     [ExportsController::class, 'products']);
                Route::get('exports/orders',       [ExportsController::class, 'orders']);

                Route::get('activity-logs',        [ActivityLogController::class, 'index']);
                Route::get('audit-logs',           [AuditLogsController::class, 'index']);
                Route::get('audit-logs/{auditLog}',[AuditLogsController::class, 'show']);

                Route::get   ('trash/{type}',               [TrashController::class, 'index']);
                Route::post  ('trash/{type}/{id}/restore',  [TrashController::class, 'restore']);
                Route::delete('trash/{type}/{id}',          [TrashController::class, 'forceDelete']);

                Route::apiResource('webhooks', WebhooksController::class);
            });

            // Promotions (hors /admin si tu veux : ici laissé global sous can:admin)
            Route::apiResource('promotions', PromotionsController::class);
        });
    });
});

<?php

namespace App\Docs\Paths;

use OpenApi\Annotations as OA;

/**
 * @OA\PathItem(
 *   path="/api/v1/orders",
 *   @OA\Post(
 *     operationId="OrdersStore",
 *     tags={"Commandes"},
 *     summary="Créer une commande",
 *     security={{"bearerAuth":{}}},
 *     @OA\RequestBody(
 *       required=true,
 *       @OA\JsonContent(
 *         required={"address","items"},
 *         @OA\Property(property="address", type="string", example="Dakar, SICAP..."),
 *         @OA\Property(
 *           property="items", type="array",
 *           @OA\Items(
 *             type="object",
 *             required={"product_id","qty"},
 *             @OA\Property(property="product_id", type="integer", example=1),
 *             @OA\Property(property="qty", type="integer", example=2, minimum=1)
 *           )
 *         )
 *       )
 *     ),
 *     @OA\Response(response=200, description="OK"),
 *     @OA\Response(response=401, description="Non authentifié"),
 *     @OA\Response(response=422, description="Validation échouée")
 *   )
 * )
 */

/**
 * @OA\PathItem(
 *   path="/api/v1/orders/mine",
 *   @OA\Get(
 *     operationId="OrdersMine",
 *     tags={"Commandes"},
 *     summary="Lister mes commandes",
 *     security={{"bearerAuth":{}}},
 *     @OA\Parameter(name="page", in="query", @OA\Schema(type="integer", minimum=1)),
 *     @OA\Parameter(name="per_page", in="query", @OA\Schema(type="integer", minimum=1, maximum=100, default=12)),
 *     @OA\Response(response=200, description="OK"),
 *     @OA\Response(response=401, description="Non authentifié")
 *   )
 * )
 */

/**
 * @OA\PathItem(
 *   path="/api/v1/orders/{order}",
 *   @OA\Get(
 *     operationId="OrdersShow",
 *     tags={"Commandes"},
 *     summary="Détail d’une commande",
 *     security={{"bearerAuth":{}}},
 *     @OA\Parameter(
 *       name="order", in="path", required=true,
 *       description="ID commande (binding)",
 *       @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response=200, description="OK"),
 *     @OA\Response(response=401, description="Non authentifié"),
 *     @OA\Response(response=403, description="Interdit"),
 *     @OA\Response(response=404, description="Introuvable")
 *   )
 * )
 */
class Orders {}

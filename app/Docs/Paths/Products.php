<?php

namespace App\Docs\Paths;

use OpenApi\Annotations as OA;

/**
 * @OA\PathItem(
 *   path="/api/v1/products",
 *   @OA\Get(
 *     operationId="ProductsIndex",
 *     tags={"Produits"},
 *     summary="Lister les produits",
 *     @OA\Parameter(name="search", in="query", @OA\Schema(type="string")),
 *     @OA\Parameter(name="category", in="query", @OA\Schema(type="integer")),
 *     @OA\Parameter(name="sort", in="query", description="Ex: -price", @OA\Schema(type="string")),
 *     @OA\Parameter(name="page", in="query", @OA\Schema(type="integer", minimum=1)),
 *     @OA\Parameter(name="per_page", in="query", @OA\Schema(type="integer", minimum=1, maximum=100, default=12)),
 *     @OA\Response(response=200, description="OK")
 *   )
 * )
 */

/**
 * @OA\PathItem(
 *   path="/api/v1/products/{product}",
 *   @OA\Get(
 *     operationId="ProductsShow",
 *     tags={"Produits"},
 *     summary="Détail d’un produit",
 *     @OA\Parameter(
 *       name="product", in="path", required=true,
 *       description="ID produit (route model binding)",
 *       @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response=200, description="OK"),
 *     @OA\Response(response=404, description="Introuvable")
 *   )
 * )
 */
class Products {}

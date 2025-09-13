<?php

namespace App\Docs\Paths;

use OpenApi\Annotations as OA;

/**
 * Point d'entrée pour les catégories (avec PathItem explicite)
 *
 * @OA\PathItem(
 *   path="/api/v1/categories",
 *   @OA\Get(
 *     operationId="CategoriesIndex",
 *     tags={"Catégories"},
 *     summary="Lister les catégories (endpoint de test)",
 *     @OA\Response(response=200, description="OK")
 *   )
 * )
 */
class Categories {}

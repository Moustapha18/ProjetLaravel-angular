<?php
/**
 * @OA\Get(
 *   path="/api/v1/exports/products.csv",
 *   summary="Export produits (admin)",
 *   tags={"Exports"},
 *   @OA\Parameter(name="category_id", in="query", @OA\Schema(type="integer")),
 *   @OA\Parameter(name="search", in="query", @OA\Schema(type="string")),
 *   @OA\Response(response=200, description="CSV stream")
 * )
 * @OA\Get(
 *   path="/api/v1/exports/orders.csv",
 *   summary="Export commandes (admin)",
 *   tags={"Exports"},
 *   @OA\Parameter(name="status", in="query", @OA\Schema(type="string")),
 *   @OA\Parameter(name="paid", in="query", @OA\Schema(type="boolean")),
 *   @OA\Parameter(name="date_from", in="query", @OA\Schema(type="string", format="date")),
 *   @OA\Parameter(name="date_to", in="query", @OA\Schema(type="string", format="date")),
 *   @OA\Response(response=200, description="CSV stream")
 * )
 */

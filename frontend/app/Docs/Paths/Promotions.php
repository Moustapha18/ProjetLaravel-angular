<?php
/**
 * @OA\Tag(
 *   name="Promotions",
 *   description="Endpoints d'administration pour gérer les promotions"
 * )
 *
 * @OA\Get(
 *   path="/api/v1/promotions",
 *   tags={"Promotions"},
 *   summary="Lister les promotions (admin)",
 *   security={{"bearerAuth":{}}},
 *   @OA\Parameter(name="active", in="query", @OA\Schema(type="boolean")),
 *   @OA\Parameter(name="scope", in="query", @OA\Schema(type="string", enum={"PRODUCT","CATEGORY"})),
 *   @OA\Parameter(name="scope_id", in="query", @OA\Schema(type="integer")),
 *   @OA\Parameter(name="current", in="query", @OA\Schema(type="boolean")),
 *   @OA\Response(response=200, description="OK",
 *     @OA\JsonContent(
 *       @OA\Property(property="data", type="array",
 *         @OA\Items(ref="#/components/schemas/Promotion")
 *       )
 *     )
 *   )
 * )
 *
 * @OA\Post(
 *   path="/api/v1/promotions",
 *   tags={"Promotions"},
 *   summary="Créer une promotion (admin)",
 *   security={{"bearerAuth":{}}},
 *   @OA\RequestBody(
 *     required=true,
 *     @OA\JsonContent(ref="#/components/schemas/PromotionInput")
 *   ),
 *   @OA\Response(response=200, description="Créée",
 *     @OA\JsonContent(ref="#/components/schemas/Promotion")
 *   ),
 *   @OA\Response(response=422, description="Validation error")
 * )
 *
 * @OA\Get(
 *   path="/api/v1/promotions/{id}",
 *   tags={"Promotions"},
 *   summary="Voir une promotion (admin)",
 *   security={{"bearerAuth":{}}},
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\Response(response=200, description="OK",
 *     @OA\JsonContent(ref="#/components/schemas/Promotion")
 *   ),
 *   @OA\Response(response=404, description="Not found")
 * )
 *
 * @OA\Put(
 *   path="/api/v1/promotions/{id}",
 *   tags={"Promotions"},
 *   summary="Mettre à jour une promotion (admin)",
 *   security={{"bearerAuth":{}}},
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\RequestBody(required=true, @OA\JsonContent(ref="#/components/schemas/PromotionInput")),
 *   @OA\Response(response=200, description="OK",
 *     @OA\JsonContent(ref="#/components/schemas/Promotion")
 *   ),
 *   @OA\Response(response=422, description="Validation error")
 * )
 *
 * @OA\Delete(
 *   path="/api/v1/promotions/{id}",
 *   tags={"Promotions"},
 *   summary="Supprimer une promotion (admin)",
 *   security={{"bearerAuth":{}}},
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\Response(response=200, description="Supprimée")
 * )
 */

<?php
/**
 * @OA\Post(
 *   path="/api/v1/products/{id}/image",
 *   summary="Uploader/Remplacer l'image d'un produit",
 *   tags={"Products"},
 *   security={{"sanctum":{}}},
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\RequestBody(
 *     required=true,
 *     content={
 *       "multipart/form-data": {
 *         "schema": {
 *           "type": "object",
 *           "properties": {
 *             "image": {
 *               "type": "string",
 *               "format": "binary"
 *             }
 *           },
 *           "required": {"image"}
 *         }
 *       }
 *     }
 *   ),
 *   @OA\Response(response=200, description="OK (ProductResource)")
 * )
 *
 * @OA\Delete(
 *   path="/api/v1/products/{id}/image",
 *   summary="Supprimer l'image d'un produit",
 *   tags={"Products"},
 *   security={{"sanctum":{}}},
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\Response(response=200, description="OK (ProductResource)")
 * )
 */

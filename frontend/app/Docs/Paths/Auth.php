<?php

namespace App\Docs\Paths;

use OpenApi\Annotations as OA;

/**
 * @OA\PathItem(
 *   path="/login",
 *   @OA\Post(
 *     operationId="AuthLogin",
 *     tags={"Auth"},
 *     summary="Se connecter (Breeze API)",
 *     @OA\RequestBody(
 *       required=true,
 *       @OA\JsonContent(
 *         required={"email","password"},
 *         @OA\Property(property="email", type="string", format="email", example="client@demo.sn"),
 *         @OA\Property(property="password", type="string", example="password")
 *       )
 *     ),
 *     @OA\Response(response=200, description="OK"),
 *     @OA\Response(response=422, description="Validation")
 *   )
 * )
 */

/**
 * @OA\PathItem(
 *   path="/register",
 *   @OA\Post(
 *     operationId="AuthRegister",
 *     tags={"Auth"},
 *     summary="Créer un compte (Breeze API)",
 *     @OA\RequestBody(
 *       required=true,
 *       @OA\JsonContent(
 *         required={"name","email","password","password_confirmation"},
 *         @OA\Property(property="name", type="string", example="Client"),
 *         @OA\Property(property="email", type="string", format="email", example="client2@demo.sn"),
 *         @OA\Property(property="password", type="string", example="password"),
 *         @OA\Property(property="password_confirmation", type="string", example="password")
 *       )
 *     ),
 *     @OA\Response(response=200, description="OK"),
 *     @OA\Response(response=422, description="Validation")
 *   )
 * )
 */

/**
 * @OA\PathItem(
 *   path="/api/v1/me",
 *   @OA\Get(
 *     operationId="AuthMe",
 *     tags={"Auth"},
 *     summary="Infos du user courant",
 *     security={{"bearerAuth":{}}},
 *     @OA\Response(response=200, description="OK"),
 *     @OA\Response(response=401, description="Non authentifié")
 *   )
 * )
 */

/**
 * @OA\PathItem(
 *   path="/logout",
 *   @OA\Post(
 *     operationId="AuthLogout",
 *     tags={"Auth"},
 *     summary="Se déconnecter",
 *     security={{"bearerAuth":{}}},
 *     @OA\Response(response=200, description="OK"),
 *     @OA\Response(response=401, description="Non authentifié")
 *   )
 * )
 */
class Auth {}

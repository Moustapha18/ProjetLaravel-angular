<?php
/**
 * @OA\Info(
 *   version="1.0.0",
 *   title="Bakery API",
 *   description="API de gestion de boulangerie (catalogue, commandes, promos, admin)."
 * )
 * @OA\Server(
 *   url=L5_SWAGGER_CONST_HOST,
 *   description="Serveur local"
 * )
 * @OA\SecurityScheme(
 *   securityScheme="sanctum",
 *   type="http",
 *   scheme="bearer",
 *   bearerFormat="JWT"
 * )
 */

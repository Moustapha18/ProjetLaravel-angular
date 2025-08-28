<?php
/**
 * @OA\Schema(
 *   schema="Product",
 *   @OA\Property(property="id",          type="integer"),
 *   @OA\Property(property="name",        type="string"),
 *   @OA\Property(property="slug",        type="string"),
 *   @OA\Property(property="price_cents", type="integer"),
 *   @OA\Property(property="stock",       type="integer"),
 *   @OA\Property(property="image_url",   type="string", nullable=true),
 *   @OA\Property(property="category",    ref="#/components/schemas/Category")
 * )
 */

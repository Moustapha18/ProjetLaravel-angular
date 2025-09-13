<?php
/**
 * @OA\Schema(
 *   schema="OrderItem",
 *   @OA\Property(property="product_id",        type="integer"),
 *   @OA\Property(property="qty",               type="integer"),
 *   @OA\Property(property="unit_price_cents",  type="integer"),
 *   @OA\Property(property="line_total_cents",  type="integer"),
 *   @OA\Property(property="product", ref="#/components/schemas/Product", nullable=true)
 * )
 *
 * @OA\Schema(
 *   schema="DeliveryUpdate",
 *   @OA\Property(property="id",      type="integer"),
 *   @OA\Property(property="status",  type="string"),
 *   @OA\Property(property="note",    type="string", nullable=true),
 *   @OA\Property(property="created_at", type="string", format="date-time")
 * )
 *
 * @OA\Schema(
 *   schema="Order",
 *   @OA\Property(property="id",          type="integer"),
 *   @OA\Property(property="status",      type="string", enum={"EN_PREPARATION","PRETE","EN_LIVRAISON","LIVREE"}),
 *   @OA\Property(property="total_cents", type="integer"),
 *   @OA\Property(property="paid",        type="boolean"),
 *   @OA\Property(property="address",     type="string"),
 *   @OA\Property(property="items",       type="array", @OA\Items(ref="#/components/schemas/OrderItem")),
 *   @OA\Property(property="delivery_updates", type="array", @OA\Items(ref="#/components/schemas/DeliveryUpdate"))
 * )
 */

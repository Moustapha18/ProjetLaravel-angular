<?php
/**
 * @OA\Schema(
 *   schema="Promotion",
 *   @OA\Property(property="id",        type="integer"),
 *   @OA\Property(property="type",      type="string", enum={"PERCENT","FIXED"}),
 *   @OA\Property(property="value",     type="number", format="float"),
 *   @OA\Property(property="scope",     type="string", enum={"PRODUCT","CATEGORY"}),
 *   @OA\Property(property="scope_id",  type="integer", nullable=true),
 *   @OA\Property(property="starts_at", type="string", format="date-time", nullable=true),
 *   @OA\Property(property="ends_at",   type="string", format="date-time", nullable=true),
 *   @OA\Property(property="is_active", type="boolean")
 * )
 */

<?php
/**
 * @OA\Schema(
 *   schema="User",
 *   @OA\Property(property="id",   type="integer"),
 *   @OA\Property(property="name", type="string"),
 *   @OA\Property(property="email",type="string"),
 *   @OA\Property(property="role", type="string", enum={"ADMIN","EMPLOYE","CLIENT"})
 * )
 */

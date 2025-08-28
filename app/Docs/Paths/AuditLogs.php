<?php
/**
 * @OA\Get(
 *   path="/api/v1/audit-logs",
 *   tags={"Audit"},
 *   security={{"sanctum":{}}},
 *   @OA\Parameter(name="action", in="query", @OA\Schema(type="string")),
 *   @OA\Parameter(name="user_id", in="query", @OA\Schema(type="integer")),
 *   @OA\Parameter(name="subject_type", in="query", @OA\Schema(type="string")),
 *   @OA\Parameter(name="subject_id", in="query", @OA\Schema(type="integer")),
 *   @OA\Parameter(name="from", in="query", @OA\Schema(type="string", format="date")),
 *   @OA\Parameter(name="to", in="query", @OA\Schema(type="string", format="date")),
 *   @OA\Response(response=200, description="OK")
 * )
 * @OA\Get(
 *   path="/api/v1/audit-logs/{id}",
 *   tags={"Audit"},
 *   security={{"sanctum":{}}},
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\Response(response=200, description="OK")
 * )
 */

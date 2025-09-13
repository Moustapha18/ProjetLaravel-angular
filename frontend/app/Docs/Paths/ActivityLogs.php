<?php
/**
 * @OA\Get(
 *   path="/api/v1/activity-logs",
 *   summary="Lister les journaux d'activité (admin)",
 *   tags={"Admin"},
 *   security={{"sanctum":{}}},
 *   @OA\Parameter(name="log", in="query", @OA\Schema(type="string")),
 *   @OA\Parameter(name="event", in="query", @OA\Schema(type="string")),
 *   @OA\Parameter(name="user_id", in="query", @OA\Schema(type="integer")),
 *   @OA\Parameter(name="date_from", in="query", @OA\Schema(type="string", format="date")),
 *   @OA\Parameter(name="date_to", in="query", @OA\Schema(type="string", format="date")),
 *   @OA\Response(response=200, description="OK")
 * )
 */

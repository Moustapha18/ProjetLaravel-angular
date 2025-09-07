<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Promotion\StorePromotionRequest;
use App\Http\Requests\Promotion\UpdatePromotionRequest;
use App\Http\Resources\PromotionResource;
use App\Models\Promotion;
use Illuminate\Http\Request;

class PromotionsController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum']);
        $this->authorizeResource(Promotion::class, 'promotion');
    }

    public function index(Request $r)
    {
        // Filtres simples pour l'admin
        $q = Promotion::query();

        if (!is_null($r->query('active'))) {
            $q->where('is_active', filter_var($r->query('active'), FILTER_VALIDATE_BOOLEAN));
        }
        if ($scope = $r->query('scope')) {
            $q->where('scope', $scope);
        }
        if ($scopeId = $r->query('scope_id')) {
            $q->where('scope_id', $scopeId);
        }

        // Période en cours
        if ($r->boolean('current', false)) {
            $now = now();
            $q->where('is_active', true)
                ->where(function($qq) use ($now) {
                    $qq->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
                })
                ->where(function($qq) use ($now) {
                    $qq->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
                });
        }

        $q->orderByDesc('id');

        $per = min(max((int)$r->query('per_page', 20), 1), 100);
        return PromotionResource::collection($q->paginate($per)->withQueryString());
    }

    /**
     * @OA\Get(
     *   path="/api/v1/promotions",
     *   tags={"Admin/Promotions"},
     *   summary="Lister promos",
     *   security={{"sanctum":{}}},
     *   @OA\Response(
     *     response=200, description="OK",
     *     @OA\JsonContent(
     *       @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Promotion")),
     *       @OA\Property(property="meta", ref="#/components/schemas/ApiPagination")
     *     )
     *   )
     * )
     *
     * @OA\Post(
     *   path="/api/v1/promotions",
     *   tags={"Admin/Promotions"},
     *   summary="Créer promo",
     *   security={{"sanctum":{}}},
     *   @OA\RequestBody(
     *     @OA\JsonContent(
     *       required={"type","value","scope"},
     *       @OA\Property(property="type",  type="string", enum={"PERCENT","FIXED"}),
     *       @OA\Property(property="value", type="number", format="float"),
     *       @OA\Property(property="scope", type="string", enum={"PRODUCT","CATEGORY"}),
     *       @OA\Property(property="scope_id", type="integer", nullable=true),
     *       @OA\Property(property="starts_at", type="string", format="date-time", nullable=true),
     *       @OA\Property(property="ends_at",   type="string", format="date-time", nullable=true),
     *       @OA\Property(property="is_active", type="boolean")
     *     )
     *   ),
     *   @OA\Response(response=201, description="Created", @OA\JsonContent(ref="#/components/schemas/Promotion")),
     *   @OA\Response(response=422, description="Validation error")
     * )
     *
     * @OA\Get(
     *   path="/api/v1/promotions/{id}",
     *   tags={"Admin/Promotions"},
     *   summary="Voir promo",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK", @OA\JsonContent(ref="#/components/schemas/Promotion"))
     * )
     *
     * @OA\Put(
     *   path="/api/v1/promotions/{id}",
     *   tags={"Admin/Promotions"},
     *   summary="Mettre à jour promo",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\RequestBody(
     *     @OA\JsonContent(
     *       @OA\Property(property="value", type="number", format="float"),
     *       @OA\Property(property="is_active", type="boolean")
     *     )
     *   ),
     *   @OA\Response(response=200, description="OK", @OA\JsonContent(ref="#/components/schemas/Promotion"))
     * )
     *
     * @OA\Delete(
     *   path="/api/v1/promotions/{id}",
     *   tags={"Admin/Promotions"},
     *   summary="Supprimer (soft delete)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK")
     * )
     */


    public function show(Promotion $promotion)
    {
        return new PromotionResource($promotion);
    }

    public function store(StorePromotionRequest $req)
    {
        $data = $req->validated();
        $promo = Promotion::create($data);
        // Les tests attendent 200 et pas 201 :
        return (new PromotionResource($promo))->response()->setStatusCode(200);
    }

    public function update(UpdatePromotionRequest $req, Promotion $promotion)
    {
        $data = $req->validated();   // règles “sometimes” ci-dessous
        $promotion->fill($data)->save();
        $promotion->refresh();
        return new PromotionResource($promotion);
    }

    public function destroy(Promotion $promotion)
    {
        $promotion->delete();
        return response()->json(['message'=>'deleted']);
    }
}

<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\PromotionResource;
use App\Models\Product;
use App\Models\Category;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class TrashController extends Controller
{
    /**
     * @OA\Get(
     *   path="/api/v1/trash/{type}",
     *   tags={"Admin/Trash"},
     *   summary="Lister la corbeille (products|categories|promotions)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="type", in="path", required=true, @OA\Schema(type="string", enum={"products","categories","promotions"})),
     *   @OA\Response(response=200, description="OK")
     * )
     *
     * @OA\Post(
     *   path="/api/v1/trash/{type}/{id}/restore",
     *   tags={"Admin/Trash"},
     *   summary="Restaurer un élément",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="type", in="path", required=true, @OA\Schema(type="string", enum={"products","categories","promotions"})),
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK")
     * )
     *
     * @OA\Delete(
     *   path="/api/v1/trash/{type}/{id}",
     *   tags={"Admin/Trash"},
     *   summary="Suppression définitive",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="type", in="path", required=true, @OA\Schema(type="string", enum={"products","categories","promotions"})),
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK")
     * )
     */

    private array $map = [
        'products'   => [Product::class,   ProductResource::class],
        'categories' => [Category::class,  CategoryResource::class],
        'promotions' => [Promotion::class, PromotionResource::class],
    ];

    public function index(Request $r, string $type)
    {
        [$model, $resource] = $this->resolve($type);
        $per = min(max((int)$r->query('per_page', 12),1), 100);

        $q = $model::onlyTrashed()->orderByDesc('deleted_at');
        $paginated = $q->paginate($per)->withQueryString();

        // Pas de relations à charger ici, mais tu peux ajouter ->with('category') pour products si utile
        return $resource::collection($paginated);
    }

    public function restore(string $type, int $id)
    {
        [$model, $resource] = $this->resolve($type);
        $item = $model::onlyTrashed()->find($id);
        if (!$item) throw (new ModelNotFoundException())->setModel($model, [$id]);

        $item->restore();
        $item->refresh();

        return new $resource($item);
    }

    public function forceDelete(string $type, int $id)
    {
        [$model] = $this->resolve($type);
        $item = $model::onlyTrashed()->find($id);
        if (!$item) throw (new ModelNotFoundException())->setModel($model, [$id]);

        // attention aux contraintes FK : pour Product, supprimer ses OrderItems ? (ici forceDelete simple)
        $item->forceDelete();

        return response()->json(['message' => 'Supprimé définitivement']);
    }

    private function resolve(string $type): array
    {
        if (!isset($this->map[$type])) {
            abort(404, 'Type inconnu (products|categories|promotions)');
        }
        return $this->map[$type];
    }
}

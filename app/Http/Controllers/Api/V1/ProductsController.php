<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\ImportProductsRequest;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Requests\Product\UploadProductImageRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\Imports\ProductCsvImporter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductsController extends Controller
{
    /**
     * @OA\Get(
     *   path="/api/v1/products",
     *   tags={"Catalogue"},
     *   summary="Liste paginée des produits",
     *   @OA\Parameter(name="search", in="query", @OA\Schema(type="string")),
     *   @OA\Parameter(name="category", in="query", @OA\Schema(type="integer")),
     *   @OA\Parameter(name="sort", in="query", description="ex: -price_cents", @OA\Schema(type="string")),
     *   @OA\Response(
     *     response=200, description="OK",
     *     @OA\JsonContent(
     *       @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Product")),
     *       @OA\Property(property="meta", ref="#/components/schemas/ApiPagination")
     *     )
     *   )
     * )
     *
     * @OA\Get(
     *   path="/api/v1/products/{id}",
     *   tags={"Catalogue"},
     *   summary="Détail produit",
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK", @OA\JsonContent(ref="#/components/schemas/Product")),
     *   @OA\Response(response=404, description="Not found")
     * )
     */

    public function index(Request $r)
    {
        $params = [
            'search'   => $r->query('search'),
            'category' => $r->query('category'),
            'sort'     => $r->query('sort'),
            'page'     => (int)$r->query('page', 1),
            'per_page' => (int)$r->query('per_page', 12),
        ];

        // clé versionnée (groupe "products")
        $key = \App\Support\CacheVersion::key('products', $params);

        // mise en cache 120s (tu peux monter à 300s)
        return \Cache::remember($key, 120, function () use ($r) {
            $q = \App\Models\Product::with('category');

            if ($s = $r->query('search')) {
                $q->where(fn($qq) => $qq->where('name','like',"%$s%")->orWhere('description','like',"%$s%"));
            }
            if ($c = $r->query('category')) {
                $q->where('category_id', $c);
            }

            if ($sort = $r->query('sort')) {
                $dir = str_starts_with($sort, '-') ? 'desc' : 'asc';
                $col = ltrim($sort, '-');
                if (in_array($col, ['name','price_cents','stock','id'])) {
                    $q->orderBy($col, $dir);
                }
            } else {
                $q->orderBy('id','desc');
            }

            $per = min(max((int)$r->query('per_page', 12), 1), 100);
            return \App\Http\Resources\ProductResource::collection(
                $q->paginate($per)->withQueryString()
            );
        });
    }
    public function uploadImage(UpdateProductImageRequest $req, \App\Models\Product $product)
    {
        $file = $req->file('image');

        // Nom propre
        $name = Str::slug($product->slug ?: $product->name).'-'.time().'.'.$file->getClientOriginalExtension();

        // Disque courant (public ou s3)
        $disk = config('filesystems.default');

        // Chemin
        $path = $file->storeAs('products', $name, $disk);

        // (Optionnel) supprimer l’ancienne image si tu veux
        if ($product->image_path && Storage::disk($disk)->exists($product->image_path)) {
            Storage::disk($disk)->delete($product->image_path);
        }

        $product->update(['image_path' => $path]);

        // URL publique
        $url = Storage::disk($disk)->url($path);

        return (new ProductResource($product->fresh('category')))->additional([
            'meta'=>['image_url'=>$url]
        ]);
    }
    public function import(ImportProductsRequest $req, ProductCsvImporter $importer)
    {
        $file = $req->file('file');
        $dry  = (bool)$req->boolean('dry_run', false);

        $result = $importer->import($file->getRealPath(), $dry);

        return response()->json([
            'data' => $result,
            'meta' => ['dry_run' => $dry],
        ]);
    }

    public function deleteImage(\App\Models\Product $product)
    {
        Gate::authorize('admin');

        if ($product->image_path && Storage::disk('public')->exists($product->image_path)) {
            Storage::disk('public')->delete($product->image_path);
        }

        $product->update(['image_path' => null]);
        $product->load('category');

        return new \App\Http\Resources\ProductResource($product);
    }

    public function store(StoreProductRequest $req)
    {
        $data = $req->validated();

        if ($req->hasFile('image')) {
            $path = $req->file('image')->store('products', 'public');
            $data['image_path'] = $path;
        }

        $product = Product::create($data);
        $product->load('category');
        $diff = ['before'=>null, 'after'=>$product->only(['name','slug','price_cents','stock','category_id'])];
        app(\App\Services\AuditService::class)->log(auth()->id(), 'created', $product, $diff);


        return (new ProductResource($product))->response()->setStatusCode(201);
    }

    public function update(UpdateProductRequest $req, Product $product)
    {
        $data = $req->validated();

        if ($req->hasFile('image')) {
            // supprimer l’ancienne si existe (optionnel)
            if ($product->image_path && Storage::disk('public')->exists($product->image_path)) {
                Storage::disk('public')->delete($product->image_path);
            }
            $data['image_path'] = $req->file('image')->store('products', 'public');
        }

        $product->update($data);
        $product->load('category');
        $diff = app(\App\Services\AuditService::class)->diff($product);
        app(\App\Services\AuditService::class)->log(auth()->id(), 'updated', $product, $diff);


        return new ProductResource($product);
    }

    public function destroy(Product $product){
        $product->delete();
        $payload = ['before'=>$product->only(['id','name','slug']), 'after'=>null];
        app(\App\Services\AuditService::class)->log(auth()->id(), 'deleted', $product, $payload);

        return response()->json(['message'=>'Produit supprimé']);
    }


    /**
     * Delete image for a product (ADMIN)
     */

}

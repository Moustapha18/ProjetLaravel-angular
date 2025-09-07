<?php
namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Support\Facades\Schema;   // ✅ import
use Illuminate\Support\Str;              // ✅ import

class ProductsAdminController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum','can:manage-catalog']);
    }

    public function store(StoreProductRequest $req)
    {
        try {
            $data = $req->validated();

            // Garde uniquement les colonnes présentes
            $allowed = ['name','price_cents','category_id','description','stock','percent_off'];
            $data = array_intersect_key($data, array_flip($allowed));

            // 👇 Gérer le slug seulement si la colonne existe
            if (Schema::hasColumn('products','slug')) {
                $base = Str::slug($data['name']);
                $slug = $base;
                $i = 1;
                // ⚠️ pas de withTrashed si modèle n’a pas SoftDeletes
                while (Product::query()->where('slug',$slug)->exists()) {
                    $slug = $base.'-'.$i++;
                }
                $data['slug'] = $slug;
            }

            $product = Product::create($data);

            return (new ProductResource($product->load('category')))
                ->response()
                ->setStatusCode(201);
        } catch (\Throwable $e) {
            \Log::error('ADMIN/PRODUCTS store failed', [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'STORE_ERROR: '.$e->getMessage()], 500);
        }
    }

    // app/Http/Controllers/Api/V1/Admin/ProductsAdminController.php
    public function update(UpdateProductRequest $req, Product $product)
    {
        try {
            $in  = $req->validated();

            // Ne garder que les colonnes vraiment existantes en DB
            $allowed = ['name','price_cents','category_id','description','stock','percent_off'];
            $data = array_intersect_key($in, array_flip($allowed));

            // Recalcule éventuellement le slug *seulement si la colonne existe*
            if (\Illuminate\Support\Facades\Schema::hasColumn('products','slug')
                && array_key_exists('name', $data)
                && $data['name'] !== $product->name) {

                $base = \Illuminate\Support\Str::slug($data['name']);
                $slug = $base; $i = 1;

                // Ne PAS utiliser withTrashed si le modèle n’a pas SoftDeletes
                while (Product::query()
                    ->where('slug', $slug)
                    ->where('id', '!=', $product->id)
                    ->exists()) {
                    $slug = $base.'-'.$i++;
                }
                $data['slug'] = $slug;
            }

            // Upload image si fichier fourni (facultatif)
            if ($req->hasFile('image')) {
                $path = $req->file('image')->store('products','public');
                if ($product->image_path && \Storage::disk('public')->exists($product->image_path)) {
                    \Storage::disk('public')->delete($product->image_path);
                }
                $data['image_path'] = $path;
            }

            // Mise à jour
            $product->update($data);

            return new \App\Http\Resources\ProductResource($product->fresh('category'));
        } catch (\Throwable $e) {
            \Log::error('ADMIN/PRODUCTS update failed', [
                'product_id' => $product->id,
                'input'      => $req->all(),
                'error'      => $e->getMessage(),
            ]);
            return response()->json(['message' => 'UPDATE_ERROR: '.$e->getMessage()], 500);
        }
    }


    public function destroy(Product $product)
    {
        if ($product->image_path && \Storage::disk('public')->exists($product->image_path)) {
            \Storage::disk('public')->delete($product->image_path);
        }
        $product->delete(); // soft ou hard selon ton modèle
        return response()->json(['message'=>'deleted']);
    }

    public function uploadImage(\Illuminate\Http\Request $req, Product $product)
    {
        $req->validate(['image' => ['required','image','max:5120']]);
        $path = $req->file('image')->store('products','public');
        if ($product->image_path && \Storage::disk('public')->exists($product->image_path)) {
            \Storage::disk('public')->delete($product->image_path);
        }
        $product->update(['image_path' => $path]);
        return new ProductResource($product->fresh('category'));
    }

    public function deleteImage(Product $product)
    {
        if ($product->image_path && \Storage::disk('public')->exists($product->image_path)) {
            \Storage::disk('public')->delete($product->image_path);
        }
        $product->update(['image_path' => null]);
        return response()->json(['message' => 'image deleted']);
    }

    public function restore($id)
    {
        $prod = Product::query()->findOrFail($id); // pas withTrashed()
        // si tu veux vraiment restore, active SoftDeletes sur le modèle
        return new ProductResource($prod->load('category'));
    }
}

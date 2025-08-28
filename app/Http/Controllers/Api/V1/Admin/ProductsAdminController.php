<?php
namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Support\Str;

class ProductsAdminController extends Controller
{
    public function __construct(){ $this->middleware(['auth:sanctum','can:admin']); }

    public function store(StoreProductRequest $req)
    {
        $data = $req->validated();
        $slug = Str::slug($data['name']); $base=$slug; $i=1;
        while (Product::withTrashed()->where('slug',$slug)->exists()) $slug = $base.'-'.$i++;
        $data['slug'] = $slug;

        if ($req->hasFile('image')) {
            $data['image_path'] = $req->file('image')->store('products','public');
        }

        $product = Product::create($data);
        return (new ProductResource($product->load('category')))->response()->setStatusCode(201);
    }

    public function update(UpdateProductRequest $req, Product $product)
    {
        $data = $req->validated();

        if (array_key_exists('name',$data) && $data['name'] !== $product->name) {
            $slug = Str::slug($data['name']); $base=$slug; $i=1;
            while (Product::withTrashed()->where('slug',$slug)->where('id','!=',$product->id)->exists()) $slug = $base.'-'.$i++;
            $data['slug'] = $slug;
        }

        if ($req->hasFile('image')) {
            $path = $req->file('image')->store('products','public');
            if ($product->image_path && \Storage::disk('public')->exists($product->image_path)) {
                \Storage::disk('public')->delete($product->image_path);
            }
            $data['image_path'] = $path;
        }

        $product->update($data);
        return new ProductResource($product->fresh('category'));
    }

    public function destroy(Product $product)
    {
        if ($product->image_path && \Storage::disk('public')->exists($product->image_path)) {
            \Storage::disk('public')->delete($product->image_path);
        }
        $product->delete(); // soft delete
        return response()->json(['message'=>'deleted']);
    }

    public function restore($id)
    {
        $prod = Product::withTrashed()->findOrFail($id);
        $prod->restore();
        return new ProductResource($prod->load('category'));
    }
}

<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductMediaController extends Controller
{
    public function store(Request $r, Product $product)
    {
        $r->validate(['image'=>'required|image|max:2048']);
        $path = $r->file('image')->store('products','public');
        // supprime l’ancienne si existait
        if ($product->image_path && \Storage::disk('public')->exists($product->image_path)) {
            \Storage::disk('public')->delete($product->image_path);
        }
        $product->update(['image_path'=>$path]);
        return new ProductResource($product->fresh('category'));
    }

    public function destroy(Product $product)
    {
        if ($product->image_path && \Storage::disk('public')->exists($product->image_path)) {
            \Storage::disk('public')->delete($product->image_path);
        }
        $product->update(['image_path'=>null]);
        return response()->json(['message'=>'image removed']);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductsController extends Controller
{
    // GET /api/v1/products?search=&page=&per_page=
    public function index(Request $request)
    {
        $q       = trim((string) $request->query('search', ''));
        $perPage = (int) $request->query('per_page', 12);
        $perPage = max(1, min(100, $perPage)); // garde-fou

        $query = Product::query()->with('category');

        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        $paginator = $query->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        // option: expose "image_url" calculée
        $items = collect($paginator->items())->map(function ($p) {
            $p->image_url = $p->image_path ? Storage::url($p->image_path) : null;
            return $p;
        })->values();

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'total'        => $paginator->total(),
            ],
        ]);
    }

    // GET /api/v1/products/{product}
    public function show($id)
    {
        $product = Product::with('category')->findOrFail($id);
        $product->image_url = $product->image_path ? Storage::url($product->image_path) : null;

        return response()->json($product);
    }

    // POST /api/v1/admin/products
    public function store(Request $request)
    {
        try {
            \Log::info('STORE PRODUCT payload', $request->all());

            $data = $request->validate([
                'name'         => ['required','string','max:255'],
                'price_cents'  => ['required','integer','min:0'],
                'description'  => ['nullable','string'],
                'category_id'  => ['nullable','integer','exists:categories,id'],
                'stock'        => ['nullable','integer','min:0'],
                'percent_off'  => ['nullable','integer','min:0','max:100'],
            ]);

            $product = \App\Models\Product::create($data);

            return response()->json(['data' => $product], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::warning('STORE PRODUCT validation failed', ['errors' => $e->errors()]);
            return response()->json(['message' => 'Validation error', 'errors' => $e->errors()], 422);
        } catch (\Throwable $e) {
            \Log::error('STORE PRODUCT failed', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
                // 'trace' => $e->getTraceAsString(), // décommente si besoin
            ]);
            return response()->json(['message' => 'Server error: '.$e->getMessage()], 500);
        }
    }


    // PUT /api/v1/admin/products/{product}
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'name'         => ['sometimes', 'required', 'string', 'max:255'],
            'price_cents'  => ['sometimes', 'required', 'integer', 'min:0'],
            'description'  => ['nullable', 'string'],
            'category_id'  => ['nullable', 'integer', 'exists:categories,id'],
            'stock'        => ['nullable', 'integer', 'min:0'],
            'percent_off'  => ['nullable', 'integer', 'min:0', 'max:100'],
        ]);

        $product->update($data);
        $product->load('category');
        $product->image_url = $product->image_path ? Storage::url($product->image_path) : null;

        return response()->json($product);
    }

    // DELETE /api/v1/admin/products/{product}
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete(); // soft delete si activé dans le modèle
        return response()->json(['message' => 'Produit supprimé']);
    }

    // POST /api/v1/admin/products/{product}/image
    public function uploadImage(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'image' => ['required', 'file', 'image', 'max:4096'], // 4MB
        ]);

        // Supprime l’ancienne image si présente
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }

        $path = $request->file('image')->store('products', 'public');

        $product->image_path = $path;
        $product->save();

        return response()->json([
            'message'   => 'Image mise à jour',
            'image_url' => Storage::url($path),
            'product'   => $product->fresh('category'),
        ]);
    }

    // (facultatif) Restauration corbeille
    public function restore($id)
    {
        $product = Product::withTrashed()->findOrFail($id);
        $product->restore();
        return response()->json(['message' => 'Produit restauré']);
    }

    // (facultatif) Suppression définitive
    public function forceDelete($id)
    {
        $product = Product::withTrashed()->findOrFail($id);
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }
        $product->forceDelete();
        return response()->json(['message' => 'Produit supprimé définitivement']);
    }
}

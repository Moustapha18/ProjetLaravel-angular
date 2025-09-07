<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoriesController extends Controller
{
    // GET /api/v1/categories (public)
    public function index(Request $request)
    {
        $q = Category::query()->orderBy('name');
        // Si tu veux une pagination:
        // $data = $q->paginate($request->integer('per_page', 12));
        // return response()->json(['data' => $data->items(), 'meta' => [
        //    'current_page' => $data->currentPage(),
        //    'last_page'    => $data->lastPage(),
        //    'total'        => $data->total(),
        // ]]);

        $data = $q->get();
        return response()->json(['data' => $data]);
    }

    // POST /api/v1/admin/categories (auth + manage-catalog)


    // PUT /api/v1/admin/categories/{category}
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => [
                'required','string','max:255',
                Rule::unique('categories','name')->ignore($category->id),
            ],
        ]);

        $category->update($validated);

        return response()->json(['data' => $category]);
    }

    // DELETE /api/v1/admin/categories/{category}
    public function destroy(Category $category)
    {
        $category->delete(); // soft delete si activé
        return response()->json(['message' => 'Catégorie supprimée']);
    }
    public function store(Request $req) {
        $data = $req->validate([
            'name' => ['required','string','max:255','unique:categories,name'],
            'description' => ['nullable','string'],
        ]);

        try {
            $slug = $base = Str::slug($data['name']);
            $i = 1;
            while (Category::withTrashed()->where('slug',$slug)->exists()) {
                $slug = $base.'-'.$i++;
            }

            $cat = Category::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'slug' => $slug,
            ]);

            return (new CategoryResource($cat))->response()->setStatusCode(201);

        } catch (\Throwable $e) {
            // En dev: APP_DEBUG=true => utile pour voir l’erreur réelle
            \Log::error('Category store failed', ['error'=>$e->getMessage(), 'trace'=>$e->getTraceAsString()]);
            return response()->json([
                'message' => 'Erreur lors de la création de la catégorie.',
                'error'   => app()->hasDebugModeEnabled() ? $e->getMessage() : null,
            ], 500);
        }
    }

}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Models\Category;
use Psy\Util\Str;

class CategoriesController extends Controller
{
    public function store(StoreCategoryRequest $r){
    $c = Category::create(['name'=>$r->name,'slug'=>Str::slug($r->name)]);
    return response()->json(['data'=>$c],201);
}
    public function update(UpdateCategoryRequest $r, Category $category){
        $data = $r->validated();
        if(isset($data['name'])) $data['slug']=Str::slug($data['name']);
        $category->update($data);
        return response()->json(['data'=>$category]);
    }
    public function destroy(Category $category){
        $category->delete();
        return response()->json(['message'=>'Catégorie supprimée']);
    }
    /**
     * @OA\Get(
     *   path="/api/v1/categories",
     *   tags={"Catalogue"},
     *   summary="Liste des catégories",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Category"))
     *     )
     *   )
     * )
     */

    public function index()
    {
        $key = \App\Support\CacheVersion::key('categories', ['list' => true]);

        $data = \Cache::remember($key, 300, function () {
            return \App\Models\Category::query()
                ->orderBy('name')
                ->get(['id','name','slug']);
        });

        return response()->json(['data' => $data]);
    }


}

<?php
namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoriesAdminController extends Controller
{
    public function __construct(){ $this->middleware(['auth:sanctum','can:admin']); }

    public function store(StoreCategoryRequest $req)
    {
        $name = $req->string('name');
        $slug = Str::slug($name);
        // unique slug
        $base = $slug; $i=1;
        while (Category::withTrashed()->where('slug',$slug)->exists()) $slug = $base.'-'.$i++;

        $cat = Category::create(['name'=>$name, 'slug'=>$slug]);
        return response()->json(['data'=>$cat], 201); // CREATED (REST)
    }

    public function update(UpdateCategoryRequest $req, Category $category)
    {
        $name = $req->input('name', $category->name);
        if ($name !== $category->name) {
            $slug = Str::slug($name); $base=$slug; $i=1;
            while (Category::withTrashed()->where('slug',$slug)->where('id','!=',$category->id)->exists()) $slug = $base.'-'.$i++;
            $category->fill(['name'=>$name, 'slug'=>$slug]);
        } else {
            $category->fill($req->only('name'));
        }
        $category->save();
        return response()->json(['data'=>$category]);
    }

    public function destroy(Category $category)
    {
        $category->delete(); // soft delete
        return response()->json(['message'=>'deleted']);
    }

    public function restore($id)
    {
        $cat = Category::withTrashed()->findOrFail($id);
        $cat->restore();
        return response()->json(['data'=>$cat]);
    }
}

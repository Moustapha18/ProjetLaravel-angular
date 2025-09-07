<?php
namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class CategoriesAdminController extends Controller
{
    public function __construct() { $this->middleware(['auth:sanctum','can:manage-catalog']); }

    public function index(Request $req) {
        $q = trim((string) $req->get('q','')); $per = (int)$req->integer('per_page', 20);
        $query = Category::query()->orderBy('name');
        if ($q !== '') {
            $driver = \DB::getDriverName();
            $driver === 'pgsql'
                ? $query->where('name','ilike',"%{$q}%")
                : $query->whereRaw('LOWER(name) LIKE ?', ['%'.mb_strtolower($q).'%']);
        }
        return CategoryResource::collection($query->paginate($per)->withQueryString());
    }

    public function show(Category $category) { return new CategoryResource($category); }

    public function store(Request $req) {
        $data = $req->validate(['name'=>['required','string','max:255','unique:categories,name'],'description'=>['nullable','string']]);
        $slug = $base = Str::slug($data['name']); $i=1;
        while (Category::withTrashed()->where('slug',$slug)->exists()) $slug = $base.'-'.$i++;
        $cat = Category::create(['name'=>$data['name'],'description'=>$data['description']??null,'slug'=>$slug]);
        return (new CategoryResource($cat))->response()->setStatusCode(201);
    }

    public function update(Request $req, Category $category) {
        $data = $req->validate(['name'=>['nullable','string','max:255',Rule::unique('categories','name')->ignore($category->id)],'description'=>['nullable','string']]);
        if (isset($data['name']) && $data['name'] !== $category->name) {
            $slug = $base = Str::slug($data['name']); $i=1;
            while (Category::withTrashed()->where('slug',$slug)->where('id','!=',$category->id)->exists()) $slug = $base.'-'.$i++;
            $data['slug'] = $slug;
        }
        $category->update(array_filter($data, fn($v)=>!is_null($v)));
        return new CategoryResource($category);
    }

    public function destroy(Category $category) { $category->delete(); return response()->json(['message'=>'deleted']); }
}

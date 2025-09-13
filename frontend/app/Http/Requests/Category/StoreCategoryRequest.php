<?php

namespace App\Http\Requests\Category;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool { return $this->user()?->can('admin') ?? false; }
    public function rules(): array {
        return ['name'=>['required','string','max:190','unique:categories,name']];
    }
}

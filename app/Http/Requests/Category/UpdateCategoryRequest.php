<?php

namespace App\Http\Requests\Category;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest {
    public function authorize(): bool { return $this->user()?->can('admin') ?? false; }
    public function rules(): array {
        return ['name'=>['required','string','max:190', Rule::unique('categories','name')->ignore($this->route('category'))]];
    }
}

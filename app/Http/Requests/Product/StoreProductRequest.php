<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;



class StoreProductRequest extends FormRequest {
    public function authorize(): bool { return $this->user()?->can('admin') ?? false; }
    public function rules(): array {
        return [
            'category_id'  => ['required','exists:categories,id'],
            'name'         => ['required','string','max:190'],
            'price_cents'  => ['required','integer','min:0'],
            'stock'        => ['required','integer','min:0'],
            'description'  => ['nullable','string'],
            'image'        => ['nullable','image','max:2048','mimes:jpg,jpeg,png,webp'],
        ];
    }
}


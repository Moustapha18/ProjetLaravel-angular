<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class ProductImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Gate admin (ou policy) — on suppose que le middleware 'can:admin' protège déjà la route
        return true;
    }

    public function rules(): array
    {
        return [
            'image' => ['required','file','image','mimes:jpg,jpeg,png,webp','max:2048'], // 2MB
        ];
    }
}

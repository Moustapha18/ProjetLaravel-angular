<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-catalog') ?? false;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['sometimes','exists:categories,id'],
            'name'        => ['sometimes','string','max:190'],
            'price_cents' => ['sometimes','integer','min:0'],
            'stock'       => ['sometimes','nullable','integer','min:0'],
            'description' => ['nullable','string'],
            'percent_off' => ['sometimes','nullable','integer','min:0','max:100'],
            'image'       => ['nullable','image','max:2048','mimes:jpg,jpeg,png,webp'],
        ];
    }
}

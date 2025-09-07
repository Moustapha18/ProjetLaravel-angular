<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductImageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'image' => [
                'required','image','mimes:jpg,jpeg,png,webp',
                'max:3072', // 3MB
                'dimensions:min_width=400,min_height=400'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'image.dimensions' => 'Image trop petite (min 400x400).',
        ];
    }
}

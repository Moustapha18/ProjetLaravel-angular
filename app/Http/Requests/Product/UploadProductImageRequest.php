<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class UploadProductImageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // protégé par middleware 'can:admin' au niveau route
        return true;
    }

    public function rules(): array
    {
        return [
            'image' => ['required','image','mimes:jpeg,png,jpg,webp','max:2048'], // 2MB
        ];
    }
}

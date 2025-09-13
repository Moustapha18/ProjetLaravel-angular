<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class ImportProductsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'file' => ['required','file','mimes:csv,txt','max:10240'], // 10MB
            'dry_run' => ['sometimes','boolean'], // true => valider sans écrire
        ];
    }
}

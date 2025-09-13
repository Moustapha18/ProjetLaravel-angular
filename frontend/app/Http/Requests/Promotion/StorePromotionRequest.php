<?php

namespace App\Http\Requests\Promotion;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePromotionRequest extends FormRequest
{
    public function authorize(): bool { return true; }


    public function rules(): array
    {
        $type  = $this->input('type');
        $scope = $this->input('scope');

        return [
            'type'  => ['required','string', Rule::in(['PERCENT','FIXED'])],
            'value' => array_filter([
                'required','numeric','min:0.01',
                $type === 'PERCENT' ? 'max:100' : null,
            ]),
            'scope'    => ['required','string', Rule::in(['PRODUCT','CATEGORY'])],
            'scope_id' => array_filter([
                'required','integer',
                $scope === 'PRODUCT'  ? 'exists:products,id'   : null,
                $scope === 'CATEGORY' ? 'exists:categories,id' : null,
            ]),
            'starts_at' => ['nullable','date'],
            'ends_at'   => ['nullable','date','after_or_equal:starts_at'],
            'is_active' => ['boolean'],
        ];
    }
}

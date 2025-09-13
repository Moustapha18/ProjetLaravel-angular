<?php

namespace App\Http\Requests\Promotion;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePromotionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $type  = $this->input('type', $this->promotion->type ?? null);
        $scope = $this->input('scope', $this->promotion->scope ?? null);

        return [
            'type'  => ['sometimes','string', Rule::in(['PERCENT','FIXED'])],
            'value' => array_filter([
                'sometimes','numeric','min:0.01',
                $type === 'PERCENT' ? 'max:100' : null,
            ]),
            'scope'    => ['sometimes','string', Rule::in(['PRODUCT','CATEGORY'])],
            'scope_id' => array_filter([
                'sometimes','integer',
                $scope === 'PRODUCT'  ? 'exists:products,id'   : null,
                $scope === 'CATEGORY' ? 'exists:categories,id' : null,
            ]),
            'starts_at' => ['sometimes','nullable','date'],
            'ends_at'   => ['sometimes','nullable','date','after_or_equal:starts_at'],
            'is_active' => ['sometimes','boolean'],
        ];
    }
}

<?php
namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class AddDeliveryUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-orders') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required','string','max:190'],
            'note'   => ['nullable','string','max:2000'],
        ];
    }
}

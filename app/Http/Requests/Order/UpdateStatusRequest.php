<?php
namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-orders') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required','string','in:EN_PREPARATION,PRETE,EN_LIVRAISON,LIVREE'],
        ];
    }
}

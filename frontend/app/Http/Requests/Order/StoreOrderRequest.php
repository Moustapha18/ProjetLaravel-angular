<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool { return true; }


    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(){
    return [
        'address'=>['required','string','max:1000'],
        'items'  =>['required','array','min:1'],
        'items.*.product_id'=>['required','exists:products,id'],
        'items.*.qty'       =>['required','integer','min:1'],
    ];
}

}

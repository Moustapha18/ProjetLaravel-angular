<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($req){
        return [
            'id'=>$this->id,
            'status'=>$this->status->value,
            'total_cents'=>$this->total_cents,
            'paid'=>$this->paid,
            'address'=>$this->address,
            'items'=>OrderItemResource::collection($this->whenLoaded('items')),
            'delivery_updates'=>DeliveryUpdateResource::collection($this->whenLoaded('deliveryUpdates')),
        ];
    }

}

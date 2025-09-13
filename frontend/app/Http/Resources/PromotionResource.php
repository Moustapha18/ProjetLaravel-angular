<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PromotionResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'        => $this->id,
            'type'      => $this->type,
            'value'     => is_numeric($this->value) ? (float)$this->value : $this->value,
            'scope'     => $this->scope,
            'scope_id'  => $this->scope_id,
            'starts_at' => optional($this->starts_at)->toISOString(),
            'ends_at'   => optional($this->ends_at)->toISOString(),
            'is_active' => (bool)$this->is_active,
            'created_at'=> optional($this->created_at)->toISOString(),
            'updated_at'=> optional($this->updated_at)->toISOString(),
        ];
    }
}

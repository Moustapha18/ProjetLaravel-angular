<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;


class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    // app/Http/Resources/ProductResource.php (extrait)
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'name'         => $this->name,
            'price_cents'  => (int) ($this->price_cents ?? 0),
            'image_url'    => $this->image_url ?? null,
            'created_at'   => optional($this->created_at)->toISOString(),
        ];
    }



}

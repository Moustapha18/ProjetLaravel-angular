<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    // app/Http/Resources/ProductResource.php (extrait)
    public function toArray($req){
        $disk = config('filesystems.default');
        return [
            'id'   => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'price_cents' => $this->price_cents,
            'stock' => $this->stock,
            'image_url' => $this->image_path ? Storage::disk($disk)->url($this->image_path) : null,
            'category'=> new CategoryResource($this->whenLoaded('category')),
        ];
    }



}

<?php

namespace App\Exports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ProductsExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(private ?int $categoryId = null){}

    public function query()
    {
        $q = Product::query()->with('category');
        if ($this->categoryId) $q->where('category_id', $this->categoryId);
        return $q->orderBy('id', 'desc');
    }

    public function headings(): array
    {
        return ['ID','Catégorie','Nom','Slug','Prix (cents)','Stock','Image','Créé le'];
    }

    public function map($p): array
    {
        return [
            $p->id,
            optional($p->category)->name,
            $p->name,
            $p->slug,
            $p->price_cents,
            $p->stock,
            $p->image_path,
            $p->created_at?->toDateTimeString(),
        ];
    }
}

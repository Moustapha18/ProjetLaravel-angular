<?php

namespace App\Exports;

use App\Models\Order;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class OrdersExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(private ?string $status = null){}

    public function query()
    {
        $q = Order::query()->with('user');
        if ($this->status) $q->where('status', $this->status);
        return $q->orderBy('id','desc');
    }

    public function headings(): array
    {
        return ['ID','Client','Email','Total (cents)','Statut','Payé','Adresse','Créé le'];
    }

    public function map($o): array
    {
        return [
            $o->id,
            optional($o->user)->name,
            optional($o->user)->email,
            $o->total_cents,
            $o->status instanceof \BackedEnum ? $o->status->value : $o->status,
            $o->paid ? 'oui' : 'non',
            $o->address,
            $o->created_at?->toDateTimeString(),
        ];
    }
}

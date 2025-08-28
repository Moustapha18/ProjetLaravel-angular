@component('mail::message')
    # Mise à jour de votre commande #{{ $order->id }}

    Statut: **{{ $old }} ➜ {{ $new }}**

    Adresse de livraison: {{ $order->address }}

    @component('mail::table')
        | Produit | Qté | Prix (CFA) |
        |:--|:--:|--:|
        @foreach($order->items as $it)
            | {{ $it->product->name }} | {{ $it->qty }} | {{ number_format($it->line_total_cents/100, 0, ',', ' ') }} |
        @endforeach
    @endcomponent

    **Total:** {{ number_format($order->total_cents/100, 0, ',', ' ') }} CFA

    Merci pour votre confiance.

@endcomponent

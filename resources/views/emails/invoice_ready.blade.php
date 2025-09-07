@component('mail::message')
    # Merci pour votre commande !

    Numéro de commande : **#{{ $order->id }}**
    Facture : **{{ $invoice->number }}**

    @component('mail::button', ['url' => $urlPdf])
        Télécharger la facture (PDF)
    @endcomponent

    Merci,
    **Bakery**
@endcomponent

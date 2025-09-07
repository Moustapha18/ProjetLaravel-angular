<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Storage;

class InvoiceReadyNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private Order $order) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $order   = $this->order->loadMissing('invoice','user');
        $invoice = $order->invoice;
        $path    = $invoice ? Storage::disk('public')->path($invoice->pdf_path) : null;

        $mail = (new MailMessage)
            ->subject('Votre facture '.$invoice?->number.' - Commande #'.$order->id)
            ->greeting('Bonjour '.$order->user->name.' 👋')
            ->line('Merci pour votre commande #'.$order->id.'. Votre paiement a bien été reçu.')
            ->line('Vous trouverez votre facture en pièce jointe.')
            ->action('Voir ma commande', url("/orders/{$order->id}"))
            ->line('À bientôt !');

        if ($path && is_file($path)) {
            $mail->attach($path, [
                'as'   => ($invoice?->number ?? 'invoice').'.pdf',
                'mime' => 'application/pdf',
            ]);
        }

        return $mail;
    }
}

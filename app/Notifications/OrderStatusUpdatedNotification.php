<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Order $order, public string $old, public string $new) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Mise à jour du statut de votre commande')
            ->greeting('Bonjour '.$notifiable->name)
            ->line("Commande #{$this->order->id}: {$this->old} → {$this->new}")
            ->action('Voir votre commande', url('/'))
            ->line('Merci de votre confiance.');
    }
}

<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Order $order) {}

    public function via($notifiable): array
    {
        return ['mail']; // plus tard: 'database'
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Votre commande a été créée')
            ->greeting('Bonjour '.$notifiable->name)
            ->line('Merci pour votre commande #'.$this->order->id)
            ->line('Statut: '.$this->order->status->value ?? $this->order->status)
            ->action('Voir votre commande', url('/')) // mets le lien front plus tard
            ->line('Nous vous tiendrons informé des mises à jour.');
    }
}

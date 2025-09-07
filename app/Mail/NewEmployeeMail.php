<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewEmployeeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user, public string $plainPassword)
    {}

    public function build()
    {
        return $this->subject('Votre compte a été créé')
            ->markdown('emails.new-employee', [
                'user' => $this->user,
                'plainPassword' => $this->plainPassword,
                'loginUrl' => config('app.frontend_url') ?: url('/'), // configure si besoin
            ]);
    }
}

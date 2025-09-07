<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EmployeeWelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $clearPassword
    ) {}

    public function build()
    {
        return $this->subject('Bienvenue - Accès employé')
            ->markdown('emails.employee_welcome', [
                'user'          => $this->user,
                'clearPassword' => $this->clearPassword,
                'loginUrl'      => config('app.frontend_url', 'http://localhost:4200/login'),
            ]);
    }
}

@component('mail::message')
    # Bonjour {{ $user->name }},

    Votre compte **employé** a été créé.

    **Identifiants**
    - Email : {{ $user->email }}
    - Mot de passe initial : **{{ $clearPassword }}**

    @component('mail::button', ['url' => $loginUrl])
        Se connecter
    @endcomponent

    > Pour votre sécurité, changez ce mot de passe après connexion.

    Merci,
    {{ config('app.name') }}
@endcomponent

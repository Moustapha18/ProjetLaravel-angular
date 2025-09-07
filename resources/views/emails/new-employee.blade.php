@component('mail::message')
    # Bonjour {{ $user->name }},

    Votre compte a été créé sur **{{ config('app.name') }}**.

    **Rôle :** {{ $user->role }}
    **Email :** {{ $user->email }}
    **Mot de passe temporaire :** `{{ $plainPassword }}`

    @component('mail::button', ['url' => $loginUrl])
        Se connecter
    @endcomponent

    Veuillez vous connecter et changer votre mot de passe dès que possible.

    Merci,
    L’équipe {{ config('app.name') }}
@endcomponent

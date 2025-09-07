<?php
namespace App\Enums;

enum OrderStatus: string {
    case PENDING       = 'PENDING';       // <== ajouter
    case EN_PREPARATION = 'EN_PREPARATION';
    case PRETE          = 'PRETE';
    case EN_LIVRAISON   = 'EN_LIVRAISON';
    case LIVREE         = 'LIVREE';
    case CANCELLED      = 'CANCELLED';    // <== ajouter aussi si tu gères l’annulation
}

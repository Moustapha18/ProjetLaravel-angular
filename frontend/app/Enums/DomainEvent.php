<?php
namespace App\Enums;

enum DomainEvent:string {
    case ORDER_CREATED = 'order.created';
    case ORDER_PAID = 'order.paid';
    case ORDER_STATUS_UPDATED = 'order.status_updated';
}

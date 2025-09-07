import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderStatus',
  standalone: true,          // 👈 indispensable
})
export class OrderStatusPipe implements PipeTransform {
  transform(v?: string): { label: string; cls: string } {
    const s = String(v || '').toUpperCase();
    switch (s) {
      case 'EN_PREPARATION': return { label: 'En préparation', cls: 'chip chip-warn' };
      case 'PRETE':          return { label: 'Prête',          cls: 'chip chip-info' };
      case 'EN_LIVRAISON':   return { label: 'En livraison',   cls: 'chip chip-info' };
      case 'LIVREE':         return { label: 'Livrée',         cls: 'chip chip-ok'   };
      case 'ANNULEE':        return { label: 'Annulée',        cls: 'chip chip-bad'  };
      default:               return { label: s || '—',         cls: 'chip' };
    }
  }
}

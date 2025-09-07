// src/app/admin/components/shared/mini-cart.component.ts
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';

type MiniCartItem = { name: string; price_cents: number; quantity: number };

@Component({
  standalone: true,
  selector: 'app-mini-cart',
  imports: [CommonModule, RouterLink],
  template: `
  <div class="relative" (mouseenter)="open=true" (mouseleave)="open=false">
    <ng-content></ng-content>

    <div *ngIf="open" class="absolute right-0 mt-2 w-72 bg-white border rounded shadow p-3 z-50">
      <div class="font-medium mb-2">Panier</div>
      <div *ngIf="!items().length" class="text-sm text-gray-500">Votre panier est vide.</div>

      <ul class="grid gap-2 max-h-64 overflow-auto" *ngIf="items().length">
        <li *ngFor="let it of items() | slice:0:3" class="flex justify-between text-sm">
          <span class="truncate">{{ it.name }} × {{ it.quantity }}</span>
          <span>{{ ((it.price_cents || 0) * it.quantity / 100) | currency:'XOF' }}</span>
        </li>
        <li *ngIf="items().length>3" class="text-xs text-gray-500">… et {{ items().length-3 }} de plus</li>
      </ul>

      <div class="flex justify-between mt-3 text-sm border-t pt-2">
        <span>Total</span>
        <span class="font-semibold">{{ (total()/100) | currency:'XOF' }}</span>
      </div>
      <div class="mt-2 text-right">
        <a routerLink="/cart" class="text-blue-700 text-sm">Voir panier</a>
      </div>
    </div>
  </div>
  `
})
export class MiniCartComponent {
  private cart = inject(CartService);
  open = false;

  // on caste prudemment le snapshot() pour typer les items
  items = computed<MiniCartItem[]>(() => {
    const snap = (this.cart as any).snapshot?.() ?? (this.cart as any).getSnapshot?.() ?? {};
    return (snap.items as MiniCartItem[]) ?? [];
  });

  total = computed<number>(() => this.items().reduce((s, it) => s + ((it.price_cents || 0) * (it.quantity || 1)), 0));
}

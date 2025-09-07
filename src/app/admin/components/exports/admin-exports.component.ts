import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportsService } from '../../services/exports.service';

@Component({
  standalone: true,
  selector: 'app-admin-exports',
  imports: [CommonModule],
  template: `
    <h2 class="text-xl font-semibold mb-3">Exports</h2>
    <div class="grid gap-2 max-w-md">
      <button class="px-3 py-2 border rounded" (click)="dlProducts()">Produits (.csv)</button>
      <button class="px-3 py-2 border rounded" (click)="dlOrders()">Commandes (.csv)</button>
    </div>
  `
})
export class AdminExportsComponent {
  private svc = inject(ExportsService);

  private save(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  dlProducts() { this.svc.productsCsv().subscribe(b => this.save(b, `products-${Date.now()}.csv`)); }
  dlOrders()   { this.svc.ordersCsv().subscribe(b => this.save(b, `orders-${Date.now()}.csv`)); }
}

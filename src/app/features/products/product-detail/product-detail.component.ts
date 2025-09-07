import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';
import { Product } from '../../../core/models/product.models';



@Component({
standalone: true,
selector: 'app-product-details',
imports: [CommonModule],
template: `
<ng-container *ngIf="product as p; else loading">
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
<!-- <img *ngIf="p.image_url" [src]="p.image_url" class="w-full h-72 object-cover rounded"/> -->
<div>
<h2 class="text-2xl font-semibold mb-2">{{ p.name }}</h2>
<div class="text-lg mb-1">{{ (p.price_cents||0)/100 | currency:'XOF' }}</div>
<div class="text-sm text-gray-600 mb-4">Stock: {{ p.stock }}</div>
<p class="text-sm whitespace-pre-wrap">{{ p.description }}</p>
</div>
</div>
</ng-container>
<ng-template #loading>
<p>Chargement…</p>
</ng-template>
`
})
export class ProductDetailsComponent {
private route = inject(ActivatedRoute);
private productsSrv = inject(ProductsService);
product?: Product;


ngOnInit(){
const id = this.route.snapshot.paramMap.get('id')!;
this.productsSrv.get(id).subscribe((p: any) => this.product = p);
}
}
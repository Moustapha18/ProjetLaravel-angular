import { Component } from '@angular/core';
import { discountedPriceCents } from '../../../core/utils/price.util';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
//  providers: [CartService],
  templateUrl: './cart.component.html',
  styles: ``
})
export class CartComponent {

  discounted = discountedPriceCents;
 constructor(public cart: CartService) {}
cartItems: any;

  totalDiscounted() {
    return this.cart.getTotalCentsDiscounted();
  }


}

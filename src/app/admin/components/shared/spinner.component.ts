import { Component } from '@angular/core';
@Component({
  standalone: true,
  selector: 'app-spinner',
  template: `<div class="h-6 w-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>`
})
export class SpinnerComponent {}

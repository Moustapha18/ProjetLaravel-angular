import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastsService } from '../core/services/toasts.service';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="fixed top-3 right-3 z-50 grid gap-2 w-[320px]">
    <div *ngFor="let t of toasts()" class="p-3 rounded shadow text-sm"
         [class.bg-green-100]="t.type==='success'"
         [class.bg-red-100]="t.type==='error'"
         [class.bg-blue-100]="t.type==='info'">
      {{ t.text }}
    </div>
  </div>
  `
})
export class ToastsComponent {
  toastsSrv = inject(ToastsService);
  toasts = computed(() => this.toastsSrv.list());
}

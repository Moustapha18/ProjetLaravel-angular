import { Component, Input } from '@angular/core';
@Component({
  standalone: true,
  selector: 'app-skeleton-block',
  template: `<div [style.height.px]="h" class="w-full rounded bg-gray-100 animate-pulse"></div>`
})
export class SkeletonBlockComponent { @Input() h = 16; }

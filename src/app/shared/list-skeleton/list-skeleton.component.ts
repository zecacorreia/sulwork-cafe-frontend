import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-skeleton.component.html'
})
export class ListSkeletonComponent {
  @Input() count = 3;

  get skeletonItems() {
    return new Array(this.count);
  }
}
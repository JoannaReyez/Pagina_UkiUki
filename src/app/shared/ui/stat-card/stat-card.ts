import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss'
})
export class StatCardComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) value = '';
  @Input({ required: true }) caption = '';
  @Input() icon = 'bi-grid-1x2';
  @Input() accent: 'pink' | 'yellow' | 'green' | 'purple' = 'pink';
}

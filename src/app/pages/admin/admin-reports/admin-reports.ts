import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { StoreService } from '../../../store.service';

@Component({
  selector: 'app-admin-reports-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.scss'
})
export class AdminReportsPage {
  constructor(public store: StoreService) {}
}

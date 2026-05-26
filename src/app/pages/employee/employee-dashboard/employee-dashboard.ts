import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { StoreService } from '../../../store.service';
import { StatCardComponent } from '../../../shared/ui/stat-card/stat-card';

@Component({
  selector: 'app-employee-dashboard-page',
  standalone: true,
  imports: [CommonModule, StatCardComponent],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.scss'
})
export class EmployeeDashboardPage {
  constructor(public auth: AuthService, public store: StoreService) {}
}

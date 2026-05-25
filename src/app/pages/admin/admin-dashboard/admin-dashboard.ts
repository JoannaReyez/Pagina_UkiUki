import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { StoreService } from '../../../store.service';
import { StatCardComponent } from '../../../shared/ui/stat-card/stat-card';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboardPage {
  readonly chartPoints = '10,215 50,195 90,180 130,150 170,158 210,122 250,96 290,92 330,118 370,140 410,132 450,105 490,152 530,124 570,98 610,136 650,92 690,76 730,54 770,20';

  constructor(public store: StoreService, public auth: AuthService) {}
}

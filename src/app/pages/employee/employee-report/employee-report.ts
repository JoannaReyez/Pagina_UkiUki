import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { StoreService } from '../../../store.service';

@Component({
  selector: 'app-employee-report-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-report.html',
  styleUrl: './employee-report.scss'
})
export class EmployeeReportPage {
  constructor(public auth: AuthService, public store: StoreService) {}
}

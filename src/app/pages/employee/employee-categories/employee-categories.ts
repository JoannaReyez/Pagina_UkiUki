import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { StoreService } from '../../../store.service';

@Component({
  selector: 'app-employee-categories-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-categories.html',
  styleUrl: './employee-categories.scss'
})
export class EmployeeCategoriesPage {
  constructor(public store: StoreService) {}
}

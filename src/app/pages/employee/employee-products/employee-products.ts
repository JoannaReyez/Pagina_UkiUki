import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { StoreService } from '../../../store.service';

@Component({
  selector: 'app-employee-products-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-products.html',
  styleUrl: './employee-products.scss'
})
export class EmployeeProductsPage {
  constructor(public store: StoreService) {}
}

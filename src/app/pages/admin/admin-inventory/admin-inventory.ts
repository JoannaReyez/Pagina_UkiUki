import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../../store.service';
import { InventoryMovement } from '../../../data/inventory-mock';

@Component({
  selector: 'app-admin-inventory-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-inventory.html',
  styleUrl: './admin-inventory.scss'
})
export class AdminInventoryPage {
  form: InventoryMovement = {
    id: 0,
    type: 'Entrada',
    product: '',
    quantity: 0,
    date: '16 may 2026',
    reason: ''
  };

  constructor(public store: StoreService) {}

  save(): void {
    if (!this.form.product.trim() || !this.form.quantity) return;
    const nextId = Math.max(0, ...this.store.inventoryMovements().map(item => item.id)) + 1;
    this.store.addMovement({ ...this.form, id: nextId });
    this.form = { id: 0, type: 'Entrada', product: '', quantity: 0, date: '16 may 2026', reason: '' };
  }
}

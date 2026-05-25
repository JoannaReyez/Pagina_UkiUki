import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../../store.service';
import { InventoryProduct } from '../../../data/inventory-mock';

@Component({
  selector: 'app-admin-products-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.scss'
})
export class AdminProductsPage {
  editingId: number | null = null;

  form: Omit<InventoryProduct, 'id'> = {
    image: '/koro1.png',
    name: '',
    price: 0,
    stock: 0,
    description: '',
    category: 'Snacks',
    status: 'Activo'
  };

  constructor(public store: StoreService) {}

  startEdit(product: InventoryProduct): void {
    this.editingId = product.id;
    this.form = { ...product };
  }

  resetForm(): void {
    this.editingId = null;
    this.form = {
      image: '/koro1.png',
      name: '',
      price: 0,
      stock: 0,
      description: '',
      category: 'Snacks',
      status: 'Activo'
    };
  }

  save(): void {
    if (!this.form.name.trim()) {
      return;
    }

    if (this.editingId) {
      this.store.updateProduct(this.editingId, this.form);
    } else {
      const nextId = Math.max(0, ...this.store.inventoryProducts().map(item => item.id)) + 1;
      this.store.addProduct({ id: nextId, ...this.form });
    }

    this.resetForm();
  }

  remove(productId: number): void {
    this.store.removeProduct(productId);
  }
}

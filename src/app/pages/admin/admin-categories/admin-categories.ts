import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../../store.service';
import { InventoryCategory } from '../../../data/inventory-mock';

@Component({
  selector: 'app-admin-categories-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.scss'
})
export class AdminCategoriesPage {
  showModal = false;
  editingId: number | null = null;
  form: Omit<InventoryCategory, 'id'> = { name: '', description: '', productsCount: 0, active: true };

  constructor(public store: StoreService) {}

  openCreateModal(): void {
    this.editingId = null;
    this.form = { name: '', description: '', productsCount: 0, active: true };
    this.showModal = true;
  }

  startEdit(category: InventoryCategory): void {
    this.editingId = category.id;
    this.form = { ...category };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.reset();
  }

  reset(): void {
    this.editingId = null;
    this.form = { name: '', description: '', productsCount: 0, active: true };
  }

  save(): void {
    if (!this.form.name.trim()) return;

    if (this.editingId) {
      this.store.updateCategory(this.editingId, this.form);
    } else {
      const nextId = Math.max(0, ...this.store.inventoryCategories().map(item => item.id)) + 1;
      this.store.addCategory({ id: nextId, ...this.form });
    }

    this.closeModal();
  }

  remove(categoryId: number): void {
    this.store.removeCategory(categoryId);
  }
}

import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../../store.service';

@Component({
  selector: 'app-employee-categories-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-categories.html',
  styleUrl: './employee-categories.scss'
})
export class EmployeeCategoriesPage {
  readonly searchTerm = signal('');
  readonly activeOnly = signal(false);

  constructor(public store: StoreService) {}

  readonly filteredCategories = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    return this.store.inventoryCategories().filter(category => {
      const matchesTerm =
        !term ||
        category.name.toLowerCase().includes(term) ||
        category.description.toLowerCase().includes(term);
      const matchesStatus = !this.activeOnly() || category.active;

      return matchesTerm && matchesStatus;
    });
  });

  productsInCategory(categoryName: string): number {
    return this.store.inventoryProducts().filter(product => product.category === categoryName).length;
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.activeOnly.set(false);
  }
}

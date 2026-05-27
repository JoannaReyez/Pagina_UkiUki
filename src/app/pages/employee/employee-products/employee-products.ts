import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InventoryProduct } from '../../../data/inventory-mock';
import { StoreService } from '../../../store.service';

@Component({
  selector: 'app-employee-products-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-products.html',
  styleUrl: './employee-products.scss'
})
export class EmployeeProductsPage {
  readonly searchTerm = signal('');
  readonly selectedCategory = signal('Todos');
  readonly selectedStatus = signal('Todos');
  readonly lowStockOnly = signal(false);
  readonly saleQuantities = signal<Record<number, number>>({});
  readonly saleMessage = signal('');

  constructor(public store: StoreService) {}

  readonly categories = computed(() => [
    'Todos',
    ...Array.from(new Set(this.store.inventoryProducts().map(product => product.category)))
  ]);

  readonly statuses = computed(() => [
    'Todos',
    ...Array.from(new Set(this.store.inventoryProducts().map(product => product.status)))
  ]);

  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    return this.store.inventoryProducts().filter(product => {
      const matchesTerm =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term);
      const matchesCategory = this.selectedCategory() === 'Todos' || product.category === this.selectedCategory();
      const matchesStatus = this.selectedStatus() === 'Todos' || product.status === this.selectedStatus();
      const matchesStock = !this.lowStockOnly() || product.stock <= 10;

      return matchesTerm && matchesCategory && matchesStatus && matchesStock;
    });
  });

  readonly totalStock = computed(() =>
    this.filteredProducts().reduce((total, product) => total + product.stock, 0)
  );

  readonly lowStockCount = computed(() =>
    this.store.inventoryProducts().filter(product => product.stock <= 10).length
  );

  quantityFor(productId: number): number {
    return this.saleQuantities()[productId] ?? 1;
  }

  setQuantity(product: InventoryProduct, value: number | string): void {
    const parsed = Number(value);
    const quantity = Number.isFinite(parsed) ? Math.floor(parsed) : 1;
    const nextQuantity = Math.min(Math.max(quantity, 1), Math.max(product.stock, 1));

    this.saleQuantities.update(current => ({ ...current, [product.id]: nextQuantity }));
  }

  decreaseQuantity(product: InventoryProduct): void {
    this.setQuantity(product, this.quantityFor(product.id) - 1);
  }

  increaseQuantity(product: InventoryProduct): void {
    this.setQuantity(product, this.quantityFor(product.id) + 1);
  }

  sellProduct(product: InventoryProduct): void {
    const quantity = this.quantityFor(product.id);
    const sold = this.store.sellInventoryProduct(product.id, quantity);

    if (!sold) {
      this.saleMessage.set(`No hay stock suficiente para vender ${product.name}.`);
      return;
    }

    this.saleQuantities.update(current => ({ ...current, [product.id]: 1 }));
    this.saleMessage.set(`Venta registrada: ${quantity} ${product.name}.`);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set('Todos');
    this.selectedStatus.set('Todos');
    this.lowStockOnly.set(false);
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { EmployeeInventoryProduct } from '../../../services/http';
import { StoreService } from '../../../store.service';

@Component({
  selector: 'app-employee-products-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-products.html',
  styleUrl: './employee-products.scss'
})
export class EmployeeProductsPage implements OnInit {
  readonly searchTerm = signal('');
  readonly selectedStatus = signal('Todos');
  readonly lowStockOnly = signal(false);
  readonly saleQuantities = signal<Record<number, number>>({});
  readonly saleMessage = signal('');
  readonly selectedProducts = signal<number[]>([]);

  constructor(public store: StoreService, private auth: AuthService) {}

  ngOnInit(): void {
    const user = this.auth.user();
    if (user?.id) {
      this.store.loadEmployeeInventory(Number(user.id));
    }
  }

  readonly statuses = computed(() => [
    'Todos',
    ...Array.from(new Set(this.store.employeeInventory().map(product => product.status)))
  ]);

  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    return this.store.employeeInventory().filter(product => {
      const matchesTerm =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term);
      const matchesStatus = this.selectedStatus() === 'Todos' || product.status === this.selectedStatus();
      const matchesStock = !this.lowStockOnly() || product.stock <= 10;

      return matchesTerm && matchesStatus && matchesStock;
    });
  });

  readonly totalStock = computed(() =>
    this.filteredProducts().reduce((total, product) => total + product.stock, 0)
  );

  readonly lowStockCount = computed(() =>
    this.store.employeeInventory().filter(product => product.stock <= 10).length
  );

  quantityFor(productId: number): number {
    return this.saleQuantities()[productId] ?? 1;
  }

  setQuantity(product: EmployeeInventoryProduct, value: number | string): void {
    const parsed = Number(value);
    const quantity = Number.isFinite(parsed) ? Math.floor(parsed) : 1;
    const nextQuantity = Math.min(Math.max(quantity, 1), Math.max(product.stock, 1));

    this.saleQuantities.update(current => ({ ...current, [product.productId]: nextQuantity }));
  }

  decreaseQuantity(product: EmployeeInventoryProduct): void {
    this.setQuantity(product, this.quantityFor(product.productId) - 1);
  }

  increaseQuantity(product: EmployeeInventoryProduct): void {
    this.setQuantity(product, this.quantityFor(product.productId) + 1);
  }

  sellProduct(product: EmployeeInventoryProduct): void {
    const quantity = this.quantityFor(product.productId);
    
    if (quantity > product.stock) {
      this.saleMessage.set(`No hay stock suficiente para vender ${product.name}.`);
      return;
    }

    this.saleQuantities.update(current => ({ ...current, [product.productId]: 1 }));
    this.saleMessage.set(`Venta registrada: ${quantity} ${product.name}.`);
  }

  toggleSelect(productId: number): void {
    const list = [...this.selectedProducts()];
    const idx = list.indexOf(productId);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(productId);
    this.selectedProducts.set(list);
  }

  isSelected(productId: number): boolean {
    return this.selectedProducts().includes(productId);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('Todos');
    this.lowStockOnly.set(false);
  }
}

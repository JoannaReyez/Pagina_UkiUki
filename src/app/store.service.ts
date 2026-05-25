import { Injectable, signal, computed } from '@angular/core';
import { Product, products } from './data/product-mock';
import {
  adminReportSummary,
  EmployeeRecord,
  employeeRecords,
  employeeReportSummary,
  inventoryCategories,
  inventoryMetrics,
  inventoryMovements,
  inventoryProducts,
  InventoryCategory,
  InventoryMovement,
  InventoryProduct
} from './data/inventory-mock';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  products = products;
  inventoryProducts = signal<InventoryProduct[]>(inventoryProducts);
  inventoryCategories = signal<InventoryCategory[]>(inventoryCategories);
  inventoryMovements = signal<InventoryMovement[]>(inventoryMovements);
  employees = signal<EmployeeRecord[]>(employeeRecords);
  adminReportSummary = adminReportSummary;
  employeeReportSummary = employeeReportSummary;
  dashboardMetrics = inventoryMetrics;
  cartItems = signal<CartItem[]>([]);
  favorites = signal<number[]>([1, 3]);
  activeTheme = signal('Claro');
  notificationsEnabled = signal(true);

  readonly cartCount = computed(() => this.cartItems().reduce((sum, item) => sum + item.quantity, 0));
  readonly cartTotal = computed(() => this.cartItems().reduce((sum, item) => sum + item.product.priceNum * item.quantity, 0));

  logout(): void {
    this.cartItems.set([]);
    this.favorites.set([1, 3]);
  }

  addToCart(product: Product): void {
    const items = [...this.cartItems()];
    const existing = items.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ product, quantity: 1 });
    }
    this.cartItems.set(items);
  }

  removeFromCart(index: number): void {
    const items = [...this.cartItems()];
    items.splice(index, 1);
    this.cartItems.set(items);
  }

  increaseQty(index: number): void {
    const items = [...this.cartItems()];
    items[index].quantity += 1;
    this.cartItems.set(items);
  }

  decreaseQty(index: number): void {
    const items = [...this.cartItems()];
    if (items[index].quantity > 1) {
      items[index].quantity -= 1;
    } else {
      items.splice(index, 1);
    }
    this.cartItems.set(items);
  }

  toggleFavorite(productId: number): void {
    const favorites = [...this.favorites()];
    const index = favorites.indexOf(productId);
    if (index >= 0) {
      favorites.splice(index, 1);
    } else {
      favorites.push(productId);
    }
    this.favorites.set(favorites);
  }

  isFavorite(productId: number): boolean {
    return this.favorites().includes(productId);
  }

  getProductById(id: number): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  getLowStockProducts(): InventoryProduct[] {
    return this.inventoryProducts().filter(product => product.stock <= 8);
  }

  getActiveEmployees(): EmployeeRecord[] {
    return this.employees().filter(employee => employee.status === 'Activo');
  }

  addProduct(product: InventoryProduct): void {
    this.inventoryProducts.update(current => [product, ...current]);
  }

  updateProduct(productId: number, changes: Partial<InventoryProduct>): void {
    this.inventoryProducts.update(current =>
      current.map(product => (product.id === productId ? { ...product, ...changes } : product))
    );
  }

  removeProduct(productId: number): void {
    this.inventoryProducts.update(current => current.filter(product => product.id !== productId));
  }

  addCategory(category: InventoryCategory): void {
    this.inventoryCategories.update(current => [category, ...current]);
  }

  updateCategory(categoryId: number, changes: Partial<InventoryCategory>): void {
    this.inventoryCategories.update(current =>
      current.map(category => (category.id === categoryId ? { ...category, ...changes } : category))
    );
  }

  removeCategory(categoryId: number): void {
    this.inventoryCategories.update(current => current.filter(category => category.id !== categoryId));
  }

  addMovement(movement: InventoryMovement): void {
    this.inventoryMovements.update(current => [movement, ...current]);
  }

  addEmployee(employee: EmployeeRecord): void {
    this.employees.update(current => [employee, ...current]);
  }

  updateEmployee(employeeId: number, changes: Partial<EmployeeRecord>): void {
    this.employees.update(current =>
      current.map(employee => (employee.id === employeeId ? { ...employee, ...changes } : employee))
    );
  }

  removeEmployee(employeeId: number): void {
    this.employees.update(current => current.filter(employee => employee.id !== employeeId));
  }

  toggleTheme(): void {
    this.activeTheme.set(this.activeTheme() === 'Claro' ? 'Oscuro' : 'Claro');
  }

  toggleNotifications(): void {
    this.notificationsEnabled.set(!this.notificationsEnabled());
  }
}

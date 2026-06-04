import { Injectable, computed, effect, signal } from '@angular/core';
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
import { Http, EmployeeInventoryProduct } from './services/http';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly inventoryProductsKey = 'ukiuki.inventoryProducts';
  private readonly inventoryCategoriesKey = 'ukiuki.inventoryCategories';
  private readonly inventoryMovementsKey = 'ukiuki.inventoryMovements';
  private readonly employeeInventoryKey = 'ukiuki.employeeInventory';

  products = products;
  inventoryProducts = signal<InventoryProduct[]>(this.readStorage(this.inventoryProductsKey, inventoryProducts));
  inventoryCategories = signal<InventoryCategory[]>(this.readStorage(this.inventoryCategoriesKey, inventoryCategories));
  inventoryMovements = signal<InventoryMovement[]>(this.readStorage(this.inventoryMovementsKey, inventoryMovements));
  employeeInventory = signal<EmployeeInventoryProduct[]>(this.readStorage(this.employeeInventoryKey, []));
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

  constructor(private api: Http) {
    effect(() => this.writeStorage(this.inventoryProductsKey, this.inventoryProducts()));
    effect(() => this.writeStorage(this.inventoryCategoriesKey, this.inventoryCategories()));
    effect(() => this.writeStorage(this.inventoryMovementsKey, this.inventoryMovements()));
    effect(() => this.writeStorage(this.employeeInventoryKey, this.employeeInventory()));

    this.loadFromApi();
  }

  private loadFromApi(): void {
    this.api.getProductos().subscribe(products => {
      if (products && products.length) {
        this.inventoryProducts.set(products as InventoryProduct[]);
      }
    });

    this.api.getMovimientos().subscribe(movements => {
      if (movements && movements.length) {
        this.inventoryMovements.set(movements as any);
      }
    });
  }

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

  sellInventoryProduct(productId: number, quantity: number): boolean {
    const product = this.inventoryProducts().find(item => item.id === productId);
    const saleQuantity = Math.max(1, Math.floor(quantity));

    if (!product || product.stock < saleQuantity) {
      return false;
    }

    const nextStock = product.stock - saleQuantity;

    this.updateProduct(productId, {
      stock: nextStock,
      status: this.getInventoryStatus(nextStock)
    });

    this.addMovement({
      id: Math.max(0, ...this.inventoryMovements().map(item => item.id)) + 1,
      type: 'Salida',
      product: product.name,
      quantity: saleQuantity,
      date: new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
      reason: 'Venta registrada por empleado'
    });

    return true;
  }

  registerInventoryEntry(productId: number, quantity: number, reason?: string): boolean {
    const product = this.inventoryProducts().find(item => item.id === productId);
    const entryQuantity = Math.max(1, Math.floor(quantity));

    if (!product || !Number.isFinite(quantity)) {
      return false;
    }

    const nextStock = product.stock + entryQuantity;

    this.updateProduct(productId, {
      stock: nextStock,
      status: this.getInventoryStatus(nextStock)
    });

    this.addMovement({
      id: Math.max(0, ...this.inventoryMovements().map(item => item.id)) + 1,
      type: 'Entrada',
      product: product.name,
      quantity: entryQuantity,
      date: new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
      reason: reason?.trim() || 'Entrada registrada por empleado'
    });

    return true;
  }

  registerNewInventoryProductEntry(
    productData: Pick<InventoryProduct, 'name' | 'price' | 'description' | 'category' | 'image'>,
    quantity: number,
    reason?: string
  ): InventoryProduct | null {
    const entryQuantity = Math.max(1, Math.floor(quantity));
    const productName = productData.name.trim();
    const existingProduct = this.inventoryProducts().find(
      product => product.name.trim().toLowerCase() === productName.toLowerCase()
    );

    if (!productName || !Number.isFinite(productData.price) || productData.price < 0 || !Number.isFinite(quantity)) {
      return null;
    }

    if (existingProduct) {
      const registered = this.registerInventoryEntry(existingProduct.id, entryQuantity, reason);

      return registered
        ? this.inventoryProducts().find(product => product.id === existingProduct.id) ?? existingProduct
        : null;
    }

    const nextId = Math.max(0, ...this.inventoryProducts().map(product => product.id)) + 1;
    const newProduct: InventoryProduct = {
      id: nextId,
      image: productData.image || '/products/mochi-box.svg',
      name: productName,
      price: productData.price,
      stock: entryQuantity,
      description: productData.description.trim() || 'Producto registrado por empleado',
      category: productData.category.trim() || 'General',
      status: this.getInventoryStatus(entryQuantity)
    };

    this.addProduct(newProduct);
    this.addMovement({
      id: Math.max(0, ...this.inventoryMovements().map(item => item.id)) + 1,
      type: 'Entrada',
      product: newProduct.name,
      quantity: entryQuantity,
      date: new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
      reason: reason?.trim() || 'Alta de producto y entrada inicial'
    });

    return newProduct;
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

  // ─── INVENTARIO DE EMPLEADO ───────────────────────────────────────────────

  loadEmployeeInventory(employeeId: number): void {
    this.api.getInventarioEmpleado(employeeId).subscribe(products => {
      if (products && products.length) {
        this.employeeInventory.set(products);
      } else {
        this.employeeInventory.set([]);
      }
    });
  }

  updateEmployeeInventoryProduct(employeeId: number, productId: number, stock: number, status: string): void {
    this.employeeInventory.update(current =>
      current.map(product => 
        product.productId === productId 
          ? { ...product, stock, status: status as any } 
          : product
      )
    );
  }

  getEmployeeProductById(productId: number): EmployeeInventoryProduct | null {
    return this.employeeInventory().find(p => p.productId === productId) ?? null;
  }

  private getInventoryStatus(stock: number): InventoryProduct['status'] {
    if (stock <= 0) {
      return 'Agotado';
    }

    return stock <= 10 ? 'Bajo stock' : 'Activo';
  }

  private readStorage<T>(key: string, fallback: T): T {
    if (!this.canUseStorage()) {
      return fallback;
    }

    try {
      const saved = window.localStorage.getItem(key);

      if (!saved) {
        return fallback;
      }

      return JSON.parse(saved) as T;
    } catch {
      this.removeStorage(key);
      return fallback;
    }
  }

  private writeStorage<T>(key: string, value: T): void {
    if (!this.canUseStorage()) {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      this.removeStorage(key);
    }
  }

  private canUseStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  private removeStorage(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      return;
    }
  }
}

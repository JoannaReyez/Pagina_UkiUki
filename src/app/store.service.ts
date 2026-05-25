import { Injectable, signal, computed } from '@angular/core';
import { Product, products } from './data/product-mock';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  products = products;
  cartItems = signal<CartItem[]>([]);
  favorites = signal<number[]>([1, 3]);
  isLoggedIn = signal(false);
  activeTheme = signal('Claro');
  notificationsEnabled = signal(true);

  readonly cartCount = computed(() => this.cartItems().reduce((sum, item) => sum + item.quantity, 0));
  readonly cartTotal = computed(() => this.cartItems().reduce((sum, item) => sum + item.product.priceNum * item.quantity, 0));

  login(email: string, password: string): { success: boolean; role: string } {
    const emailLower = email.trim().toLowerCase();

    if (emailLower === 'admin' && password === 'admin123') {
      this.isLoggedIn.set(true);
      return { success: true, role: 'admin' };
    }

    if (emailLower === 'usuario1' && password === 'usuario123') {
      this.isLoggedIn.set(true);
      return { success: true, role: 'user' };
    }

    if (emailLower === 'empleado1' && password === 'empleado123') {
      return { success: true, role: 'employee' };
    }

    return { success: false, role: '' };
  }

  logout(): void {
    this.isLoggedIn.set(false);
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

  toggleTheme(): void {
    this.activeTheme.set(this.activeTheme() === 'Claro' ? 'Oscuro' : 'Claro');
  }

  toggleNotifications(): void {
    this.notificationsEnabled.set(!this.notificationsEnabled());
  }
}

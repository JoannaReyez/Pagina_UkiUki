import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { InventoryProduct } from '../../../data/inventory-mock';
import { StoreService } from '../../../store.service';

@Component({
  selector: 'app-employee-report-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-report.html',
  styleUrl: './employee-report.scss'
})
export class EmployeeReportPage {
  readonly searchTerm = signal('');
  readonly selectedType = signal('Todos');
  readonly productSelection = signal<number | 'new' | null>(null);
  readonly selectedProductId = signal<number | null>(null);
  readonly entryQuantity = signal(1);
  readonly entryReason = signal('');
  readonly entryMessage = signal('');
  readonly entryMessageType = signal<'success' | 'error'>('success');
  readonly isCreatingProduct = signal(false);
  readonly newProductName = signal('');
  readonly newProductPrice = signal(0);
  readonly newProductCategory = signal('Snacks');
  readonly newProductDescription = signal('');

  constructor(public auth: AuthService, public store: StoreService) {}

  readonly selectedProduct = computed(() =>
    this.store.inventoryProducts().find(product => product.id === this.selectedProductId()) ?? null
  );

  readonly productCategories = computed(() => {
    const categories = new Set(this.store.inventoryProducts().map(product => product.category));

    return ['Snacks', 'Bebidas', 'Dulces', 'Ramen', ...Array.from(categories)].filter(
      (category, index, list) => list.indexOf(category) === index
    );
  });

  readonly filteredMovements = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    return this.store.inventoryMovements().filter(movement => {
      const matchesTerm =
        !term ||
        movement.product.toLowerCase().includes(term) ||
        movement.reason.toLowerCase().includes(term) ||
        movement.date.toLowerCase().includes(term);
      const matchesType = this.selectedType() === 'Todos' || movement.type === this.selectedType();

      return matchesTerm && matchesType;
    });
  });

  readonly outputUnits = computed(() =>
    this.filteredMovements()
      .filter(movement => movement.type === 'Salida')
      .reduce((total, movement) => total + movement.quantity, 0)
  );

  readonly inputUnits = computed(() =>
    this.filteredMovements()
      .filter(movement => movement.type === 'Entrada')
      .reduce((total, movement) => total + movement.quantity, 0)
  );

  readonly estimatedTotal = computed(() =>
    this.filteredMovements()
      .filter(movement => movement.type === 'Salida')
      .reduce((total, movement) => {
        const product = this.store.inventoryProducts().find(item => item.name === movement.product);
        return total + movement.quantity * (product?.price ?? 0);
      }, 0)
  );

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedType.set('Todos');
  }

  setSelectedProduct(value: number | 'new' | string | null): void {
    if (value === 'new') {
      this.productSelection.set('new');
      this.isCreatingProduct.set(true);
      this.selectedProductId.set(null);
      this.entryMessage.set('');
      return;
    }

    if (value === null || value === '') {
      this.productSelection.set(null);
      this.isCreatingProduct.set(false);
      this.selectedProductId.set(null);
      this.entryMessage.set('');
      return;
    }

    const productId = Number(value);
    this.productSelection.set(Number.isFinite(productId) ? productId : null);
    this.isCreatingProduct.set(false);
    this.selectedProductId.set(Number.isFinite(productId) ? productId : null);
    this.entryMessage.set('');
  }

  setEntryQuantity(value: number | string): void {
    const parsed = Number(value);
    const quantity = Number.isFinite(parsed) ? Math.floor(parsed) : 1;

    this.entryQuantity.set(Math.max(quantity, 1));
    this.entryMessage.set('');
  }

  registerEntry(): void {
    if (this.isCreatingProduct()) {
      this.registerNewProductEntry();
      return;
    }

    const product = this.selectedProduct();
    const quantity = this.entryQuantity();

    if (!product) {
      this.showEntryMessage('Selecciona un producto para registrar la entrada.', 'error');
      return;
    }

    if (!Number.isFinite(quantity) || quantity < 1) {
      this.showEntryMessage('Ingresa una cantidad valida mayor a cero.', 'error');
      return;
    }

    const registered = this.store.registerInventoryEntry(product.id, quantity, this.entryReason());

    if (!registered) {
      this.showEntryMessage('No se pudo registrar la entrada. Revisa los datos.', 'error');
      return;
    }

    this.entryQuantity.set(1);
    this.entryReason.set('');
    this.showEntryMessage(`Entrada registrada: ${quantity} ${product.name}.`, 'success');
  }

  setNewProductPrice(value: number | string): void {
    const parsed = Number(value);

    this.newProductPrice.set(Number.isFinite(parsed) ? Math.max(parsed, 0) : 0);
    this.entryMessage.set('');
  }

  private registerNewProductEntry(): void {
    const quantity = this.entryQuantity();
    const name = this.newProductName().trim();
    const price = this.newProductPrice();
    const category = this.newProductCategory().trim();

    if (!name) {
      this.showEntryMessage('Escribe el nombre del nuevo producto.', 'error');
      return;
    }

    if (!Number.isFinite(quantity) || quantity < 1) {
      this.showEntryMessage('Ingresa una cantidad valida mayor a cero.', 'error');
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      this.showEntryMessage('Ingresa un precio valido para el producto.', 'error');
      return;
    }

    if (!category) {
      this.showEntryMessage('Selecciona una categoria para el producto.', 'error');
      return;
    }

    const product = this.store.registerNewInventoryProductEntry(
      {
        image: this.defaultProductImage(category),
        name,
        price,
        description: this.newProductDescription(),
        category
      },
      quantity,
      this.entryReason()
    );

    if (!product) {
      this.showEntryMessage('No se pudo crear el producto. Revisa los datos.', 'error');
      return;
    }

    this.resetNewProductForm(product);
    this.showEntryMessage(`Producto registrado y entrada agregada: ${quantity} ${product.name}.`, 'success');
  }

  private resetNewProductForm(product: InventoryProduct): void {
    this.productSelection.set(product.id);
    this.selectedProductId.set(product.id);
    this.isCreatingProduct.set(false);
    this.entryQuantity.set(1);
    this.entryReason.set('');
    this.newProductName.set('');
    this.newProductPrice.set(0);
    this.newProductCategory.set('Snacks');
    this.newProductDescription.set('');
  }

  private defaultProductImage(category: string): string {
    const images: Record<string, string> = {
      Bebidas: '/products/melon-soda.svg',
      Dulces: '/products/pepero-original.svg',
      Ramen: '/products/buldak-ramen.svg',
      Snacks: '/products/pepero-original.svg'
    };

    return images[category] ?? '/products/mochi-box.svg';
  }

  private showEntryMessage(message: string, type: 'success' | 'error'): void {
    this.entryMessage.set(message);
    this.entryMessageType.set(type);
  }
}

import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../../store.service';
import { InventoryProduct } from '../../../data/inventory-mock';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-products-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.scss'
})
export class AdminProductsPage {

  constructor(public store: StoreService) {}

  showModal = signal(false);
  editingId: number | null = null;

  selectedCategory = signal('Todos');
  lowStockOnly = signal(false);
  searchTerm = signal('');

  form: Omit<InventoryProduct, 'id'> = {
    image: '',
    name: '',
    price: 0,
    stock: 0,
    description: '',
    category: 'Snacks',
    status: 'Activo'
  };

  readonly categories = computed(() => {
    const unique = new Set(
      this.store.inventoryProducts().map(p => p.category)
    );

    return ['Todos', ...Array.from(unique)];
  });

  readonly filteredProducts = computed(() => {

  let products = [...this.store.inventoryProducts()];

  // FILTRO POR CATEGORÍA

  if (this.selectedCategory() !== 'Todos') {

    products = products.filter(
      p => p.category === this.selectedCategory()
    );

  }

  // FILTRO BAJO STOCK

  if (this.lowStockOnly()) {

    products = products.filter(
      p => p.stock <= 10
    );

  }

  // FILTRO POR BUSCADOR

  if (this.searchTerm().trim()) {

    const term = this.searchTerm().toLowerCase();

    products = products.filter(product =>
      product.name.toLowerCase().includes(term)
    );

  }

  return products;

});

  openCreateModal(): void {
    this.editingId = null;

    this.form = {
      image: '',
      name: '',
      price: 0,
      stock: 0,
      description: '',
      category: 'Snacks',
      status: 'Activo'
    };

    this.showModal.set(true);
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open'); // ←

  }

  startEdit(product: InventoryProduct): void {
    this.editingId = product.id;
    this.form = { ...product };
    this.showModal.set(true);
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open'); // ←

  }

  closeModal(): void {
    this.showModal.set(false);
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open'); // ←

  }

  save(): void {

    if (!this.form.name.trim()) return;

    if (this.editingId) {

      this.store.updateProduct(this.editingId, this.form);

    } else {

      const nextId =
        Math.max(
          0,
          ...this.store.inventoryProducts().map(p => p.id)
        ) + 1;

      this.store.addProduct({
        id: nextId,
        ...this.form
      });
    }

    this.closeModal();
  }

  remove(productId: number): void {
    this.store.removeProduct(productId);
    Swal.fire({
      title: 'Producto eliminado',
      text: 'El producto ha sido eliminado exitosamente.',
      icon: 'success',
      confirmButtonText: 'Aceptar',
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false
    });
  }

  onImageSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    const file = input.files[0];

    const reader = new FileReader();

    reader.onload = () => {
      this.form.image = reader.result as string;
    };

    reader.readAsDataURL(file);
  }
}

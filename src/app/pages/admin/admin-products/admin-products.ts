import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Http, InventoryProduct } from '../../../services/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-products-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.scss'
})
export class AdminProductsPage implements OnInit {

  constructor(private api: Http) {}

  private allProducts = signal<InventoryProduct[]>([]);

  showModal    = signal(false);
  editingId: number | null = null;
  isLoading    = false;

  selectedCategory = signal('Todos');
  lowStockOnly     = signal(false);
  searchTerm       = signal('');

  form: Omit<InventoryProduct, 'id'> = {
    image: '', name: '', price: 0, stock: 0,
    description: '', category: 'Snacks', status: 'Activo'
  };

  readonly categories = computed(() => {
    const unique = new Set(this.allProducts().map(p => p.category));
    return ['Todos', ...Array.from(unique)];
  });

  readonly filteredProducts = computed(() => {
    let products = [...this.allProducts()];

    if (this.selectedCategory() !== 'Todos') {
      products = products.filter(p => p.category === this.selectedCategory());
    }
    if (this.lowStockOnly()) {
      products = products.filter(p => p.stock <= 10);
    }
    if (this.searchTerm().trim()) {
      const term = this.searchTerm().toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(term));
    }

    return products;
  });

  ngOnInit(): void {
    this.loadProductos();
  }

  loadProductos(): void {
    this.api.getProductos().subscribe({
      next: data => this.allProducts.set(data),
      error: () => this.swalError('No se pudieron cargar los productos.')
    });
  }

  openCreateModal(): void {
    this.editingId = null;
    this.form = { image: '', name: '', price: 0, stock: 0, description: '', category: 'Snacks', status: 'Activo' };
    this.showModal.set(true);
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
  }

  startEdit(product: InventoryProduct): void {
    this.editingId = product.id;
    this.form = { ...product };
    this.showModal.set(true);
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
  }

  closeModal(): void {
    this.showModal.set(false);
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
  }

  save(): void {
    if (!this.form.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'El nombre del producto no puede estar vacío.',
        confirmButtonColor: '#f59e0b',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    this.isLoading = true;

    if (this.editingId) {
      this.api.updateProducto(this.editingId, this.form).subscribe({
        next: updated => {
          if (updated) {
            this.allProducts.update(list =>
              list.map(p => p.id === this.editingId ? updated : p)
            );
            Swal.fire({
              icon: 'success',
              title: '¡Actualizado!',
              text: `"${updated.name}" se actualizó correctamente.`,
              confirmButtonColor: '#10b981',
              timer: 2500,
              timerProgressBar: true
            });
          } else {
            this.swalError('No se pudo actualizar el producto.');
          }
          this.isLoading = false;
          this.closeModal();
        },
        error: () => {
          this.swalError('Error de conexión al actualizar.');
          this.isLoading = false;
        }
      });
    } else {
      this.api.createProducto(this.form).subscribe({
        next: created => {
          if (created) {
            this.allProducts.update(list => [...list, created]);
            Swal.fire({
              icon: 'success',
              title: '¡Producto creado!',
              text: `"${created.name}" fue agregado al catálogo.`,
              confirmButtonColor: '#10b981',
              timer: 2500,
              timerProgressBar: true
            });
          } else {
            this.swalError('No se pudo crear el producto.');
          }
          this.isLoading = false;
          this.closeModal();
        },
        error: () => {
          this.swalError('Error de conexión al crear.');
          this.isLoading = false;
        }
      });
    }
  }

  remove(id: number): void {
    const producto = this.allProducts().find(p => p.id === id);

    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar producto?',
      html: `Estás a punto de eliminar <strong>"${producto?.name}"</strong>.<br>Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    }).then(result => {
      if (!result.isConfirmed) return;

      this.api.deleteProducto(id).subscribe({
        next: ok => {
          if (ok) {
            this.allProducts.update(list => list.filter(p => p.id !== id));
            Swal.fire({
              icon: 'success',
              title: '¡Eliminado!',
              text: `"${producto?.name}" fue eliminado del catálogo.`,
              confirmButtonColor: '#10b981',
              timer: 2000,
              timerProgressBar: true
            });
          } else {
            this.swalError('No se pudo eliminar el producto.');
          }
        },
        error: () => this.swalError('Error de conexión al eliminar.')
      });
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const reader = new FileReader();
    reader.onload = () => { this.form.image = reader.result as string; };
    reader.readAsDataURL(input.files[0]);
  }

  private swalError(text: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Algo salió mal',
      text,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#ef4444'
    });
  }
}
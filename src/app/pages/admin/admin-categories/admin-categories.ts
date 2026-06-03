import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Http, InventoryCategory } from '../../../services/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-categories-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.scss'
})
export class AdminCategoriesPage implements OnInit {
  categories = signal<InventoryCategory[]>([]);
  showModal  = false;
  editingId: number | null = null;
  isLoading  = false;
  form: Omit<InventoryCategory, 'id'> = { name: '', description: '', productsCount: 0, active: true };

  constructor(private api: Http) {}

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias(): void {
    this.api.getCategorias().subscribe({
      next: data => this.categories.set(data),
      error: () => this.swalError('No se pudieron cargar las categorías.')
    });
  }

  openCreateModal(): void {
    this.editingId = null;
    this.form = { name: '', description: '', productsCount: 0, active: true };
    this.showModal = true;
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
  }

  startEdit(category: InventoryCategory): void {
    this.editingId = category.id;
    this.form = {
      name: category.name,
      description: category.description,
      productsCount: category.productsCount,
      active: category.active
    };
    this.showModal = true;
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
  }

  closeModal(): void {
    this.showModal = false;
    this.reset();
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
  }

  reset(): void {
    this.editingId = null;
    this.form = { name: '', description: '', productsCount: 0, active: true };
  }

  save(): void {
    if (!this.form.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'El nombre de la categoría no puede estar vacío.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    this.isLoading = true;

    if (this.editingId) {
      this.api.updateCategoria(this.editingId, this.form).subscribe({
        next: updated => {
          if (updated) {
            this.categories.update(list =>
              list.map(c => c.id === this.editingId ? updated : c)
            );
            Swal.fire({
              icon: 'success',
              title: '¡Actualizada!',
              text: `La categoría "${updated.name}" se actualizó correctamente.`,
              showConfirmButton: false,
              timer: 2500,
              timerProgressBar: true
            });
          } else {
            this.swalError('No se pudo actualizar la categoría.');
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
      this.api.createCategoria(this.form).subscribe({
        next: created => {
          if (created) {
            this.categories.update(list => [...list, created]);
            Swal.fire({
              icon: 'success',
              title: '¡Categoría creada!',
              text: `"${created.name}" fue agregada al catálogo.`,
              showConfirmButton: false,
              timer: 2500,
              timerProgressBar: true
            });
          } else {
            this.swalError('No se pudo crear la categoría.');
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
    const categoria = this.categories().find(c => c.id === id);

    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar categoría?',
      html: `Estás a punto de eliminar <strong>"${categoria?.name}"</strong>.<br>Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    }).then(result => {
      if (!result.isConfirmed) return;

      this.api.deleteCategoria(id).subscribe({
        next: ok => {
          if (ok) {
            this.categories.update(list => list.filter(c => c.id !== id));
            Swal.fire({
              icon: 'success',
              title: '¡Eliminada!',
              text: `"${categoria?.name}" fue eliminada del catálogo.`,
              showConfirmButton: false,
              timer: 2000,
              timerProgressBar: true
            });
          } else {
            this.swalError('No se pudo eliminar la categoría.');
          }
        },
        error: () => this.swalError('Error de conexión al eliminar.')
      });
    });
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
import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Http, EmployeeRecord } from '../../../services/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-employees-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-employees.html',
  styleUrl: './admin-employees.scss'
})
export class AdminEmployeesPage implements OnInit {

  employees = signal<EmployeeRecord[]>([]);
  editingId: number | null = null;
  modalOpen  = false;
  isLoading  = false;
  isSaving   = false;
  submitted  = false;

  form: EmployeeRecord & { password?: string } = this.emptyForm();

  readonly activeCount = computed(() =>
    this.employees().filter(e => e.status === 'Activo').length
  );

  constructor(private api: Http) {}

  ngOnInit(): void {
    this.loadEmpleados();
  }

  loadEmpleados(): void {
    this.isLoading = true;
    this.api.getEmpleados().subscribe({
      next: data => {
        this.employees.set(data);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.swalError('No se pudieron cargar los empleados.');
      }
    });
  }

  openModal(): void {
    this.editingId = null;
    this.submitted = false;
    this.form = this.emptyForm();
    this.modalOpen = true;
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
  }

  startEdit(employee: EmployeeRecord): void {
    this.editingId = employee.id;
    this.submitted = false;
    this.form = { ...employee, password: '' };
    this.modalOpen = true;
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
  }

  closeModal(): void {
    this.modalOpen  = false;
    this.submitted  = false;
    this.isSaving   = false;
    this.reset();
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
  }

  reset(): void {
    this.editingId = null;
    this.submitted = false;
    this.form = this.emptyForm();
  }

  save(): void {
    this.submitted = true;

    if (!this.form.name.trim() || !this.form.email.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'El nombre y el email son obligatorios.',
        confirmButtonColor: '#f59e0b',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    this.isSaving  = true;
    this.submitted = false;

    if (this.editingId) {
      this.api.updateEmpleado(this.editingId, this.form).subscribe({
        next: updated => {
          if (updated) {
            this.employees.update(list =>
              list.map(e => e.id === this.editingId ? updated : e)
            );
            Swal.fire({
              icon: 'success',
              title: '¡Actualizado!',
              text: `"${updated.name}" se actualizó correctamente.`,
              showConfirmButton: false,
              timer: 2500,
              timerProgressBar: true
            });
          } else {
            this.swalError('No se pudo actualizar. El email puede estar en uso.');
          }
          this.isSaving = false;
          this.closeModal();
        },
        error: () => {
          this.swalError('Error de conexión al actualizar.');
          this.isSaving = false;
        }
      });

    } else {
      this.api.createEmpleado(this.form).subscribe({
        next: created => {
          if (created) {
            this.employees.update(list => [...list, created]);
            Swal.fire({
              icon: 'success',
              title: '¡Empleado creado!',
              html: `<strong>${created.name}</strong> fue registrado correctamente.<br><small>Contraseña por defecto: <code>empleado123</code></small>`,
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true
            });
          } else {
            this.swalError('No se pudo crear el empleado. El email puede estar en uso.');
          }
          this.isSaving = false;
          this.closeModal();
        },
        error: () => {
          this.swalError('Error de conexión al crear.');
          this.isSaving = false;
        }
      });
    }
  }

  remove(id: number): void {
    const empleado = this.employees().find(e => e.id === id);

    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar empleado?',
      html: `Estás a punto de eliminar a <strong>"${empleado?.name}"</strong>.<br>Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    }).then(result => {
      if (!result.isConfirmed) return;

      this.api.deleteEmpleado(id).subscribe({
        next: ok => {
          if (ok) {
            this.employees.update(list => list.filter(e => e.id !== id));
            Swal.fire({
              icon: 'success',
              title: '¡Eliminado!',
              text: `"${empleado?.name}" fue eliminado correctamente.`,
              showConfirmButton: false,
              timer: 2000,
              timerProgressBar: true
            });
          } else {
            this.swalError('No se pudo eliminar. Puede ser un administrador protegido.');
          }
        },
        error: () => this.swalError('Error de conexión al eliminar.')
      });
    });
  }

  private emptyForm(): EmployeeRecord & { password?: string } {
    return {
      id:          0,
      name:        '',
      email:       '',
      role:        'employee',
      status:      'Activo',
      activity:    'Sin actividad',
      avatarText:  'EM',
      password:    ''
    };
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
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../../store.service';
import { EmployeeRecord } from '../../../data/inventory-mock';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-employees-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-employees.html',
  styleUrl: './admin-employees.scss'
})
export class AdminEmployeesPage {
  editingId: number | null = null;
  form: EmployeeRecord = { id: 0, name: '', email: '', role: 'employee', status: 'Activo', activity: 'Sin actividad', avatarText: 'EM' };

  constructor(public store: StoreService) {}

  startEdit(employee: EmployeeRecord): void {
    this.editingId = employee.id;
    this.form = { ...employee };
  }

  reset(): void {
    this.editingId = null;
    this.form = { id: 0, name: '', email: '', role: 'employee', status: 'Activo', activity: 'Sin actividad', avatarText: 'EM' };
  }

  save(): void {
    if (!this.form.name.trim() || !this.form.email.trim()) return;

    if (this.editingId) {
      this.store.updateEmployee(this.editingId, this.form);
    } else {
      const nextId = Math.max(0, ...this.store.employees().map(item => item.id)) + 1;
      this.store.addEmployee({ ...this.form, id: nextId });
    }

    this.reset();
  }

  remove(employeeId: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.store.removeEmployee(employeeId);

        Swal.fire({
          title: 'Eliminado',
          text: 'El empleado ha sido eliminado.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
    });
  }
}

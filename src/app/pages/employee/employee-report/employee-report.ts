import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
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

  constructor(public auth: AuthService, public store: StoreService) {}

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
}

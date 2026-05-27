import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { StoreService } from '../../../store.service';
import { StatCardComponent } from '../../../shared/ui/stat-card/stat-card';

@Component({
  selector: 'app-employee-dashboard-page',
  standalone: true,
  imports: [CommonModule, StatCardComponent],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.scss'
})
export class EmployeeDashboardPage {
  constructor(public auth: AuthService, public store: StoreService) {}

  readonly outputUnits = computed(() =>
    this.store.inventoryMovements()
      .filter(movement => movement.type === 'Salida')
      .reduce((total, movement) => total + movement.quantity, 0)
  );

  readonly estimatedTotal = computed(() =>
    this.store.inventoryMovements()
      .filter(movement => movement.type === 'Salida')
      .reduce((total, movement) => {
        const product = this.store.inventoryProducts().find(item => item.name === movement.product);
        return total + movement.quantity * (product?.price ?? 0);
      }, 0)
  );

  readonly lowStockProducts = computed(() =>
    this.store.inventoryProducts().filter(product => product.stock <= 10)
  );

  readonly recentMovements = computed(() => this.store.inventoryMovements().slice(0, 4));
}

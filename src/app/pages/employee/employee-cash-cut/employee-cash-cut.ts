import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { StoreService } from '../../../store.service';

@Component({
  selector: 'app-employee-cash-cut-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-cash-cut.html',
  styleUrl: './employee-cash-cut.scss'
})
export class EmployeeCashCutPage {
  readonly searchTerm = signal('');
  readonly selectedProductFilter = signal('Todos');
  readonly finalizationMessage = signal('');

  constructor(public auth: AuthService, public store: StoreService) {}

  readonly todayMovements = computed(() => {
    const today = new Date();
    const todayStr = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(today);
    
    return this.store.inventoryMovements().filter(movement => 
      movement.type === 'Salida' && movement.date === todayStr
    );
  });

  readonly totalSalesCount = computed(() => this.todayMovements().length);

  readonly totalUnitsSOld = computed(() =>
    this.todayMovements().reduce((total, movement) => total + movement.quantity, 0)
  );

  readonly totalCashExpected = computed(() =>
    this.todayMovements().reduce((total, movement) => {
      const product = this.store.inventoryProducts().find(item => item.name === movement.product);
      return total + movement.quantity * (product?.price ?? 0);
    }, 0)
  );

  readonly soldProducts = computed(() => {
    const products = new Map<string, { name: string; quantity: number; unitPrice: number; totalPrice: number }>();
    
    this.todayMovements().forEach(movement => {
      const product = this.store.inventoryProducts().find(item => item.name === movement.product);
      const key = movement.product;
      
      if (products.has(key)) {
        const existing = products.get(key)!;
        existing.quantity += movement.quantity;
        existing.totalPrice = existing.quantity * existing.unitPrice;
      } else {
        products.set(key, {
          name: movement.product,
          quantity: movement.quantity,
          unitPrice: product?.price ?? 0,
          totalPrice: movement.quantity * (product?.price ?? 0)
        });
      }
    });

    return Array.from(products.values());
  });

  readonly filteredSoldProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    
    return this.soldProducts().filter(product => {
      const matchesTerm = !term || product.name.toLowerCase().includes(term);
      return matchesTerm;
    });
  });

  clearFilters(): void {
    this.searchTerm.set('');
    this.finalizationMessage.set('');
  }

  finalizeCashCut(): void {
    if (this.todayMovements().length === 0) {
      this.finalizationMessage.set('No hay ventas registradas para el corte de hoy.');
      return;
    }

    const userName = this.auth.user()?.name ?? 'Empleado';
    const totalCash = this.totalCashExpected();
    const totalTransactions = this.totalSalesCount();
    const date = new Date().toLocaleDateString('es-MX');

    this.finalizationMessage.set(
      `Corte de caja finalizado por ${userName}. Total: $${totalCash.toFixed(2)} en ${totalTransactions} transacciones. (${date})`
    );

    // Aquí podrías enviar el corte de caja al backend si es necesario
  }
}

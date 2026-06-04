import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { StoreService } from '../../../store.service';
import { Http, PendingEmployeeDelivery } from '../../../services/http';

@Component({
  selector: 'app-employee-report-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-report.html',
  styleUrl: './employee-report.scss'
})
export class EmployeeReportPage implements OnInit {
  readonly searchTerm = signal('');
  readonly selectedType = signal('Todos');
  readonly entryMessage = signal('');
  readonly entryMessageType = signal<'success' | 'error'>('success');
  readonly loadingInventory = signal(false);
  readonly loadingPending = signal(false);
  readonly pendingDeliveries = signal<PendingEmployeeDelivery[]>([]);
  readonly processingDeliveryId = signal<number | null>(null);

  constructor(public auth: AuthService, public store: StoreService, private api: Http) {}

  ngOnInit(): void {
    const user = this.auth.user();
    if (user?.id) {
      const employeeId = Number(user.id);
      this.loadEmployeeInventory(employeeId);
      this.loadPendingDeliveries(employeeId);
    }
  }

  readonly employeeProducts = computed(() => this.store.employeeInventory());

  readonly filteredMovements = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    return this.store.inventoryMovements().filter(movement => {
      const matchesTerm =
        !term ||
        movement.product.toLowerCase().includes(term) ||
        movement.reason.toLowerCase().includes(term) ||
        movement.date.toLowerCase().includes(term);
      const matchesType =
        this.selectedType() === 'Todos' ||
        movement.type === this.selectedType() ||
        (this.selectedType() === 'Entrada' && movement.type === 'Entrada Aceptada');

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
      .filter(movement => movement.type === 'Entrada' || movement.type === 'Entrada Aceptada')
      .reduce((total, movement) => total + movement.quantity, 0)
  );

  readonly estimatedTotal = computed(() =>
    this.filteredMovements()
      .filter(movement => movement.type === 'Salida')
      .reduce((total, movement) => {
        const product = this.store.employeeInventory().find(item => item.name === movement.product);
        return total + movement.quantity * (product?.price ?? 0);
      }, 0)
  );

  private loadEmployeeInventory(employeeId: number): void {
    this.loadingInventory.set(true);
    this.api.getInventarioEmpleado(employeeId).subscribe({
      next: (products) => {
        this.store.employeeInventory.set(products);
        this.loadingInventory.set(false);
      },
      error: () => {
        this.loadingInventory.set(false);
        this.showEntryMessage('Error al cargar el inventario. Recarga la pagina.', 'error');
      }
    });
  }

  private loadPendingDeliveries(employeeId: number): void {
    this.loadingPending.set(true);
    this.api.getPendientesEmpleado(employeeId).subscribe({
      next: (deliveries) => {
        this.pendingDeliveries.set(deliveries);
        this.loadingPending.set(false);
      },
      error: () => {
        this.loadingPending.set(false);
        this.showEntryMessage('Error al cargar las entradas pendientes.', 'error');
      }
    });
  }

  private loadMovements(): void {
    this.api.getMovimientos().subscribe(movements => {
      this.store.inventoryMovements.set(movements as any);
    });
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedType.set('Todos');
  }

  acceptDelivery(delivery: PendingEmployeeDelivery): void {
    const user = this.auth.user();
    if (!user?.id) {
      this.showEntryMessage('No se pudo determinar tu ID. Vuelve a iniciar sesion.', 'error');
      return;
    }

    this.processingDeliveryId.set(delivery.id);
    this.api.aceptarEntrega(delivery.id).subscribe({
      next: (res) => {
        this.processingDeliveryId.set(null);

        if (res.code !== 200) {
          this.showEntryMessage((res.data as any)?.message ?? 'No se pudo aceptar la entrega.', 'error');
          return;
        }

        const updatedEmployeeStock = res.data.updatedEmployeeStock;
        if (updatedEmployeeStock) {
          this.store.updateEmployeeInventoryProduct(
            updatedEmployeeStock.employeeId,
            updatedEmployeeStock.productId,
            updatedEmployeeStock.stock,
            updatedEmployeeStock.status
          );
        }

        this.pendingDeliveries.update(list => list.filter(item => item.id !== delivery.id));
        this.loadEmployeeInventory(Number(user.id));
        this.loadMovements();
        this.showEntryMessage(
          `Entrada aceptada: ${delivery.quantity} unidades de ${this.getDeliveryProductName(delivery)}.`,
          'success'
        );
      },
      error: () => {
        this.processingDeliveryId.set(null);
        this.showEntryMessage('Error de conexion al aceptar la entrega.', 'error');
      }
    });
  }

  rejectDelivery(delivery: PendingEmployeeDelivery): void {
    const user = this.auth.user();
    if (!user?.id) {
      this.showEntryMessage('No se pudo determinar tu ID. Vuelve a iniciar sesion.', 'error');
      return;
    }

    this.processingDeliveryId.set(delivery.id);
    this.api.rechazarEntrega(delivery.id).subscribe({
      next: (res) => {
        this.processingDeliveryId.set(null);

        if (res.code !== 200) {
          this.showEntryMessage((res.data as any)?.message ?? 'No se pudo rechazar la entrega.', 'error');
          return;
        }

        this.pendingDeliveries.update(list => list.filter(item => item.id !== delivery.id));
        this.loadMovements();
        this.showEntryMessage(
          `Entrada rechazada: ${delivery.quantity} unidades de ${this.getDeliveryProductName(delivery)} regresaron al administrador.`,
          'success'
        );
      },
      error: () => {
        this.processingDeliveryId.set(null);
        this.showEntryMessage('Error de conexion al rechazar la entrega.', 'error');
      }
    });
  }

  getDeliveryProductName(delivery: PendingEmployeeDelivery): string {
    return delivery.productName ?? delivery.product ?? delivery.name ?? `Producto #${delivery.productId}`;
  }

  isEntradaType(movement: { type: string }): boolean {
    return movement.type.startsWith('Entrada');
  }

  private showEntryMessage(message: string, type: 'success' | 'error'): void {
    this.entryMessage.set(message);
    this.entryMessageType.set(type);
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Http, InventoryProduct, InventoryMovement } from '../../../services/http';
import Swal from 'sweetalert2';

export type StockStatus = 'ok' | 'low' | 'out';

interface MovementForm {
  type: 'Entrada' | 'Salida';
  productId: number | null;
  quantity: number;
  date: string;
  reason: string;
}

@Component({
  selector: 'app-admin-inventory-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-inventory.html',
  styleUrl: './admin-inventory.scss',
  providers: [Http],
})
export class AdminInventoryPage implements OnInit {

  // ── Datos como signals ─────────────────────────────────────────────────────
  private allProducts  = signal<InventoryProduct[]>([]);
  private allMovements = signal<InventoryMovement[]>([]);

  // ── Estado de carga ────────────────────────────────────────────────────────
  loading          = signal(false);
  loadingMovements = signal(false);

  // ── Tab y filtros ──────────────────────────────────────────────────────────
  activeTab   = signal<'stock' | 'history'>('stock');
  stockFilter = signal<StockStatus | 'all'>('all');
  histFilter  = signal<'Entrada' | 'Salida' | 'all'>('all');

  // ── Modal ──────────────────────────────────────────────────────────────────
  modalOpen            = signal(false);
  formError            = signal('');
  selectedProductStock = signal<number | null>(null);

  form: MovementForm = this.emptyForm();

  // ── Computed: métricas ─────────────────────────────────────────────────────
  readonly totalProducts   = computed(() => this.allProducts().length);
  readonly totalUnits      = computed(() => this.allProducts().reduce((s, p) => s + p.stock, 0));
  readonly lowStockCount   = computed(() => this.allProducts().filter(p => this.getStatus(p) === 'low').length);
  readonly outOfStockCount = computed(() => this.allProducts().filter(p => this.getStatus(p) === 'out').length);

  // ── Computed: listas filtradas ─────────────────────────────────────────────
  readonly filteredProducts = computed(() => {
    const filter = this.stockFilter();
    if (filter === 'all') return this.allProducts();
    return this.allProducts().filter(p => this.getStatus(p) === filter);
  });

  readonly filteredMovements = computed(() => {
    const filter = this.histFilter();
    if (filter === 'all') return this.allMovements();
    return this.allMovements().filter(m => m.type === filter);
  });

  // ── Computed: productos para el select del modal ───────────────────────────
  readonly products = computed(() => this.allProducts());

  // ── Usuario en sesión ──────────────────────────────────────────────────────
  private get currentUserId(): number {
    const user = JSON.parse(localStorage.getItem('user') ?? '{}');
    return user?.id ? Number(user.id) : 1;
  }

  constructor(private httpService: Http) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadMovements();
  }

  // ── Carga de datos ─────────────────────────────────────────────────────────

  loadProducts(): void {
    this.loading.set(true);
    this.httpService.getProductos().subscribe({
      next: data => {
        this.allProducts.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.swalError('No se pudieron cargar los productos.');
      }
    });
  }

  loadMovements(): void {
    this.loadingMovements.set(true);
    this.httpService.getMovimientos().subscribe({
      next: data => {
        this.allMovements.set(data);
        this.loadingMovements.set(false);
      },
      error: () => {
        this.loadingMovements.set(false);
        this.swalError('No se pudo cargar el historial.');
      }
    });
  }

  // ── Estado del producto ────────────────────────────────────────────────────

  getStatus(p: InventoryProduct): StockStatus {
    if (p.stock <= 0)             return 'out';
    if (p.status === 'Bajo stock') return 'low';
    return 'ok';
  }

  getStatusLabel(p: InventoryProduct): string {
    const map: Record<StockStatus, string> = {
      ok:  '✓ En stock',
      low: '⚠ Stock bajo',
      out: '✕ Agotado',
    };
    return map[this.getStatus(p)];
  }

  // ── Filtros ────────────────────────────────────────────────────────────────

  setStockFilter(f: StockStatus | 'all'): void { this.stockFilter.set(f); }
  setHistFilter(f: 'Entrada' | 'Salida' | 'all'): void { this.histFilter.set(f); }

  // ── Modal ──────────────────────────────────────────────────────────────────

  openModal(type: 'Entrada' | 'Salida', productId?: number): void {
    this.form = this.emptyForm();
    this.form.type = type;
    this.formError.set('');
    this.selectedProductStock.set(null);
    if (productId !== undefined) {
      this.form.productId = productId;
      this.onProductChange();
    }
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.formError.set('');
  }

  closeOnBackground(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  setModalType(type: 'Entrada' | 'Salida'): void {
    this.form.type = type;
    this.formError.set('');
  }

  onProductChange(): void {
    const p = this.allProducts().find(p => p.id === this.form.productId);
    this.selectedProductStock.set(p ? p.stock : null);
    this.formError.set('');
  }

  // ── Guardar movimiento ─────────────────────────────────────────────────────

  saveMovement(): void {
    this.formError.set('');

    if (!this.form.productId) {
      this.formError.set('Selecciona un producto para continuar.'); return;
    }
    if (!this.form.quantity || this.form.quantity < 1) {
      this.formError.set('La cantidad debe ser mayor a 0.'); return;
    }
    if (!this.form.date) {
      this.formError.set('Ingresa una fecha válida.'); return;
    }

    const product = this.allProducts().find(p => p.id === this.form.productId);
    if (!product) { this.formError.set('Producto no encontrado.'); return; }

    if (this.form.type === 'Salida' && product.stock < this.form.quantity) {
      this.formError.set(`Stock insuficiente. Disponible: ${product.stock} unidades.`); return;
    }

    this.httpService.createMovimiento({
      productId: this.form.productId!,
      type:      this.form.type,
      quantity:  this.form.quantity,
      reason:    this.form.reason || '',
      userId:    this.currentUserId,
    }).subscribe((res: { code: number; data: any }) => {
      if (res.code === 201) {

        // Actualiza stock del producto en la signal
        const updated = res.data?.updatedProduct;
        if (updated) {
          this.allProducts.update(list =>
            list.map(p => p.id === updated.id ? { ...p, stock: updated.stock, status: updated.status } : p)
          );
        }

        // Añade el nuevo movimiento al inicio de la signal
        this.allMovements.update(list => [{
          id:          res.data.id,
          type:        res.data.type,
          productId:   res.data.productId,
          product:     product.name,
          quantity:    res.data.quantity,
          stockBefore: res.data.stockBefore,
          stockAfter:  res.data.stockAfter,
          reason:      res.data.reason || 'Sin nota',
          userId:      res.data.userId,
          userName:    res.data.userName ?? '',
          date:        this.form.date,
        }, ...list]);

        this.modalOpen.set(false);
        this.formError.set('');

        Swal.fire({
          icon: 'success',
          title: this.form.type === 'Entrada' ? '¡Entrada registrada!' : '¡Salida registrada!',
          html: `<strong>${product.name}</strong><br>Cantidad: ${this.form.quantity} unidades<br>Stock: ${res.data.stockBefore} → ${res.data.stockAfter}`,
          confirmButtonColor: '#10b981',
          timer: 2500,
          timerProgressBar: true
        }).then(() => {
          this.activeTab.set('history');
        });

      } else {
        this.swalError(res.data?.message ?? 'Error al registrar el movimiento.');
      }
    });
  }

  // ── Utilidades ─────────────────────────────────────────────────────────────

  private swalError(text: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Entendido'
    });
  }

  private emptyForm(): MovementForm {
    return {
      type:      'Entrada',
      productId: null,
      quantity:  0,
      date:      new Date().toISOString().slice(0, 10),
      reason:    '',
    };
  }
}
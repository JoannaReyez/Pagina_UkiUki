import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Http, InventoryProduct, InventoryMovement } from '../../../services/http';

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

  // ── Tab y filtros ──────────────────────────────
  activeTab: 'stock' | 'history' = 'stock';
  stockFilter: StockStatus | 'all' = 'all';
  histFilter: 'Entrada' | 'Salida' | 'all' = 'all';

  // ── Estado UI ──────────────────────────────────
  loading = false;
  loadingMovements = false;
  modalOpen = false;
  formError = '';
  selectedProductStock: number | null = null;

  // ── Datos ──────────────────────────────────────
  products: InventoryProduct[] = [];
  movements: InventoryMovement[] = [];
  form: MovementForm = this.emptyForm();

  // ── Usuario en sesión ──────────────────────────
  private get currentUserId(): number {
    const user = JSON.parse(localStorage.getItem('user') ?? '{}');
    return user?.id ? Number(user.id) : 1;
  }

  constructor(private httpService: Http) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadMovements();
  }

  // ── Carga de datos ─────────────────────────────

  loadProducts(): void {
    this.loading = true;
    this.httpService.getProductos().subscribe((data: InventoryProduct[]) => {
      this.products = data;
      this.loading = false;
    });
  }

  loadMovements(): void {
    this.loadingMovements = true;
    this.httpService.getMovimientos().subscribe((data: InventoryMovement[]) => {
      this.movements = data;
      this.loadingMovements = false;
    });
  }

  // ── Métricas ───────────────────────────────────

  get totalProducts(): number { return this.products.length; }

  get totalUnits(): number {
    return this.products.reduce((sum, p) => sum + p.stock, 0);
  }

  get lowStockCount(): number {
    return this.products.filter(p => this.getStatus(p) === 'low').length;
  }

  get outOfStockCount(): number {
    return this.products.filter(p => this.getStatus(p) === 'out').length;
  }

  // ── Listas filtradas ───────────────────────────

  get filteredProducts(): InventoryProduct[] {
    if (this.stockFilter === 'all') return this.products;
    return this.products.filter(p => this.getStatus(p) === this.stockFilter);
  }

  get filteredMovements(): InventoryMovement[] {
    if (this.histFilter === 'all') return this.movements;
    return this.movements.filter(m => m.type === this.histFilter);
  }

  // ── Estado del producto ────────────────────────

  getStatus(p: InventoryProduct): StockStatus {
    if (p.stock <= 0) return 'out';
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

  // ── Filtros ────────────────────────────────────

  setStockFilter(f: StockStatus | 'all'): void { this.stockFilter = f; }
  setHistFilter(f: 'Entrada' | 'Salida' | 'all'): void { this.histFilter = f; }

  // ── Modal ──────────────────────────────────────

  openModal(type: 'Entrada' | 'Salida', productId?: number): void {
    this.form = this.emptyForm();
    this.form.type = type;
    this.formError = '';
    this.selectedProductStock = null;
    if (productId !== undefined) {
      this.form.productId = productId;
      this.onProductChange();
    }
    this.modalOpen = true;
  }

  closeModal(): void { this.modalOpen = false; this.formError = ''; }

  closeOnBackground(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  setModalType(type: 'Entrada' | 'Salida'): void {
    this.form.type = type;
    this.formError = '';
  }

  onProductChange(): void {
    const p = this.products.find(p => p.id === this.form.productId);
    this.selectedProductStock = p ? p.stock : null;
    this.formError = '';
  }

  // ── Guardar movimiento ─────────────────────────

  saveMovement(): void {
    this.formError = '';

    if (!this.form.productId) {
      this.formError = 'Selecciona un producto para continuar.'; return;
    }
    if (!this.form.quantity || this.form.quantity < 1) {
      this.formError = 'La cantidad debe ser mayor a 0.'; return;
    }
    if (!this.form.date) {
      this.formError = 'Ingresa una fecha válida.'; return;
    }

    const product = this.products.find(p => p.id === this.form.productId);
    if (!product) { this.formError = 'Producto no encontrado.'; return; }

    if (this.form.type === 'Salida' && product.stock < this.form.quantity) {
      this.formError = `Stock insuficiente. Disponible: ${product.stock} unidades.`; return;
    }

    this.httpService.createMovimiento({
      productId: this.form.productId!,
      type:      this.form.type,
      quantity:  this.form.quantity,
      reason:    this.form.reason || '',
      userId:    this.currentUserId,
    }).subscribe((res: { code: number; data: any }) => {
      if (res.code === 201) {
        const updated = res.data?.updatedProduct;
        if (updated) {
          this.products = this.products.map((p: InventoryProduct) =>
            p.id === updated.id ? { ...p, stock: updated.stock, status: updated.status } : p
          );
        }
        this.movements = [{
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
        }, ...this.movements];

        this.activeTab = 'history';
        this.closeModal();
      } else {
        this.formError = res.data?.message ?? 'Error al registrar el movimiento.';
      }
    });
  }

  // ── Utilidades ─────────────────────────────────

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
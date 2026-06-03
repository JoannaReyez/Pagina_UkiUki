import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, of } from 'rxjs';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface InventoryProduct {
  id: number;
  image: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  category: string;
  status: 'Activo' | 'Bajo stock' | 'Agotado';
}

export interface InventoryMovement {
  id: number;
  type: 'Entrada' | 'Salida';
  productId: number;
  product: string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  reason: string;
  userId: number;
  userName: string;
  date: string;
}

export type StockStatus = 'ok' | 'low' | 'out';

interface MovementForm {
  type: 'Entrada' | 'Salida';
  productId: number | null;
  quantity: number;
  date: string;
  reason: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-admin-inventory-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-inventory.html',
  styleUrl: './admin-inventory.scss',
})
export class AdminInventoryPage implements OnInit {

  private readonly API = 'http://localhost/kui.kui/Rutas.php';
  private readonly headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  // ── Tab y filtros ──────────────────────────────
  activeTab: 'stock' | 'history' = 'stock';
  stockFilter: StockStatus | 'all' = 'all';
  histFilter: 'Entrada' | 'Salida' | 'all' = 'all';

  // ── Estado ──────────────────────────────────
  loading = false;
  loadingMovements = false;
  modalOpen = false;
  formError = '';
  selectedProductStock: number | null = null;

  // ── Datos ───────────────────────────────────
  products: InventoryProduct[] = [];
  movements: InventoryMovement[] = [];

  form: MovementForm = this.emptyForm();

  // ── Usuario en sesión (ajusta según tu auth) ──
  // Cambia esto para leerlo desde tu servicio de autenticación
  private get currentUserId(): number {
    const user = JSON.parse(localStorage.getItem('user') ?? '{}');
    return user?.id ? Number(user.id) : 1;
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadMovements();
  }

  // ── Carga de datos ────────────────────────────

  loadProducts(): void {
    this.loading = true;
    this.http
      .get<{ code: number; data: InventoryProduct[] }>(`${this.API}?getProductos`)
      .pipe(catchError(() => of({ code: 500, data: [] })))
      .subscribe(res => {
        this.products = res.code === 200 ? res.data : [];
        this.loading = false;
      });
  }

  loadMovements(): void {
    this.loadingMovements = true;
    this.http
      .get<{ code: number; data: InventoryMovement[] }>(`${this.API}?getMovimientos`)
      .pipe(catchError(() => of({ code: 500, data: [] })))
      .subscribe(res => {
        this.movements = res.code === 200 ? res.data : [];
        this.loadingMovements = false;
      });
  }

  // ── Métricas ──────────────────────────────────

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

  // ── Listas filtradas ──────────────────────────

  get filteredProducts(): InventoryProduct[] {
    if (this.stockFilter === 'all') return this.products;
    return this.products.filter(p => this.getStatus(p) === this.stockFilter);
  }

  get filteredMovements(): InventoryMovement[] {
    if (this.histFilter === 'all') return this.movements;
    return this.movements.filter(m => m.type === this.histFilter);
  }

  // ── Helpers de estado ──────────────────────────

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

  // ── Filtros ───────────────────────────────────

  setStockFilter(filter: StockStatus | 'all'): void { this.stockFilter = filter; }
  setHistFilter(filter: 'Entrada' | 'Salida' | 'all'): void { this.histFilter = filter; }

  // ── Modal ─────────────────────────────────────

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

  closeModal(): void {
    this.modalOpen = false;
    this.formError = '';
  }

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
    const product = this.products.find(p => p.id === this.form.productId);
    this.selectedProductStock = product ? product.stock : null;
    this.formError = '';
  }

  // ── Guardar movimiento (llama a la API) ────────

  saveMovement(): void {
    this.formError = '';

    if (!this.form.productId) {
      this.formError = 'Selecciona un producto para continuar.';
      return;
    }
    if (!this.form.quantity || this.form.quantity < 1) {
      this.formError = 'La cantidad debe ser mayor a 0.';
      return;
    }
    if (!this.form.date) {
      this.formError = 'Ingresa una fecha válida.';
      return;
    }

    const product = this.products.find(p => p.id === this.form.productId);
    if (!product) {
      this.formError = 'Producto no encontrado.';
      return;
    }

    if (this.form.type === 'Salida' && product.stock < this.form.quantity) {
      this.formError = `Stock insuficiente. Disponible: ${product.stock} unidades.`;
      return;
    }

    const payload = {
      productId: this.form.productId,
      type:      this.form.type,
      quantity:  this.form.quantity,
      reason:    this.form.reason || '',
      userId:    this.currentUserId,
    };

    this.http
      .post<{ code: number; data: any }>(`${this.API}?createMovimiento`, payload, { headers: this.headers })
      .pipe(catchError(() => of({ code: 500, data: null })))
      .subscribe(res => {
        if (res.code === 201) {
          // Actualizar stock del producto en memoria sin recargar toda la lista
          const updated = res.data?.updatedProduct;
          if (updated) {
            this.products = this.products.map(p =>
              p.id === updated.id
                ? { ...p, stock: updated.stock, status: updated.status }
                : p
            );
          }

          // Agregar el nuevo movimiento al inicio del historial
          const newMovement: InventoryMovement = {
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
          };
          this.movements = [newMovement, ...this.movements];

          this.activeTab = 'history';
          this.closeModal();
        } else {
          this.formError = res.data?.message ?? 'Error al registrar el movimiento.';
        }
      });
  }

  // ── Nombre del producto por id (para el select) ─

  getProductName(id: number | null): string {
    if (!id) return '';
    return this.products.find(p => p.id === id)?.name ?? '';
  }

  // ── Utilidades ────────────────────────────────

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
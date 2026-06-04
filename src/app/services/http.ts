import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

export interface InventoryCategory {
  id: number;
  name: string;
  description: string;
  productsCount: number;
  active: boolean;
}

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

// ── NUEVO ──────────────────────────────────────────────────────────────────
export interface InventoryMovement {
  id: number;
  type: 'Entrada' | 'Salida' | 'Entrada Aceptada' | 'Entrada Rechazada';
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

export interface CreateMovimientoPayload {
  productId: number;
  type: 'Entrada' | 'Salida';
  quantity: number;
  reason?: string;
  userId: number;
}

// ── INVENTARIO DE EMPLEADO ─────────────────────────────────────────────────
export interface EmployeeInventoryProduct {
  productId: number;
  image: string;
  name: string;
  price: number;
  stock: number;
  status: 'Activo' | 'Bajo stock' | 'Agotado';
  category: string;
}

export interface SupplyEmployeePayload {
  productId: number;
  employeeId: number;
  quantity: number;
  reason?: string;
}

export interface SaleEmployeePayload {
  productId: number;
  employeeId: number;
  quantity: number;
  reason?: string;
}

export interface SupplyEmployeeResponse {
  pendingId?: number;
  productId: number;
  employeeId: number;
  quantity: number;
  adminStockBefore: number;
  adminStockAfter: number;
  employeeStockBefore?: number;
  employeeStockAfter?: number;
  updatedProduct: InventoryProduct;
  updatedEmployeeStock?: {
    employeeId: number;
    productId: number;
    stock: number;
    status: string;
  };
}

export interface SaleEmployeeResponse {
  productId: number;
  employeeId: number;
  quantity: number;
  employeeStockBefore: number;
  employeeStockAfter: number;
  updatedEmployeeStock: {
    employeeId: number;
    productId: number;
    stock: number;
    status: string;
  };
}

export interface PendingEmployeeDelivery {
  id: number;
  productId: number;
  employeeId: number;
  quantity: number;
  status: 'Pendiente' | 'Aceptada' | 'Rechazada';
  sentAt: string;
  answeredAt?: string | null;
  product?: string;
  productName?: string;
  name?: string;
  image?: string;
  category?: string;
}

export interface DeliveryResponse {
  deliveryId: number;
  productId: number;
  employeeId: number;
  quantity: number;
  status: 'Aceptada' | 'Rechazada';
  updatedProduct?: InventoryProduct;
  updatedEmployeeStock?: {
    employeeId: number;
    productId: number;
    stock: number;
    status: string;
  };
  movement?: InventoryMovement;
}
// ──────────────────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  code: number;
  data: T;
}

export interface EmployeeRecord {
  id: number;
  name: string;
  email: string;
  role: 'employee';
  status: 'Activo' | 'Inactivo';
  activity: string;
  avatarText: string;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class Http {
  private readonly API = 'http://localhost/kui.kui/Rutas.php';
  private readonly headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  // ─── CATEGORÍAS ────────────────────────────────────────────────────────────

  getCategorias(): Observable<InventoryCategory[]> {
    return this.http
      .get<ApiResponse<InventoryCategory[]>>(`${this.API}?getCategorias`)
      .pipe(map(res => res.code === 200 ? res.data : []), catchError(() => of([])));
  }

  createCategoria(cat: Omit<InventoryCategory, 'id'>): Observable<InventoryCategory | null> {
    return this.http
      .post<ApiResponse<InventoryCategory>>(`${this.API}?createCategoria`, cat, { headers: this.headers })
      .pipe(map(res => res.code === 201 ? res.data : null), catchError(() => of(null)));
  }

  updateCategoria(id: number, cat: Omit<InventoryCategory, 'id'>): Observable<InventoryCategory | null> {
    return this.http
      .post<ApiResponse<InventoryCategory>>(`${this.API}?updateCategoria=${id}`, cat, { headers: this.headers })
      .pipe(map(res => res.code === 200 ? res.data : null), catchError(() => of(null)));
  }

  deleteCategoria(id: number): Observable<boolean> {
    return this.http
      .get<ApiResponse<any>>(`${this.API}?deleteCategoria=${id}`)
      .pipe(map(res => res.code === 200), catchError(() => of(false)));
  }

  // ─── PRODUCTOS ─────────────────────────────────────────────────────────────

  getProductos(): Observable<InventoryProduct[]> {
    return this.http
      .get<ApiResponse<InventoryProduct[]>>(`${this.API}?getProductos`)
      .pipe(map(res => res.code === 200 ? res.data : []), catchError(() => of([])));
  }

  getProducto(id: number): Observable<InventoryProduct | null> {
    return this.http
      .get<ApiResponse<InventoryProduct>>(`${this.API}?getProducto=${id}`)
      .pipe(map(res => res.code === 200 ? res.data : null), catchError(() => of(null)));
  }

  getProductoStock(id: number): Observable<{ id: number; name: string; stock: number; status: string } | null> {
    return this.http
      .get<ApiResponse<any>>(`${this.API}?getProductoStock=${id}`)
      .pipe(map(res => (res.code === 200 ? res.data : null)), catchError(() => of(null)));
  }

  createProducto(product: Omit<InventoryProduct, 'id'>): Observable<InventoryProduct | null> {
    return this.http
      .post<ApiResponse<InventoryProduct>>(`${this.API}?createProducto`, product, { headers: this.headers })
      .pipe(map(res => res.code === 201 ? res.data : null), catchError(() => of(null)));
  }

  updateProducto(id: number, product: Omit<InventoryProduct, 'id'>): Observable<InventoryProduct | null> {
    return this.http
      .post<ApiResponse<InventoryProduct>>(`${this.API}?updateProducto=${id}`, product, { headers: this.headers })
      .pipe(map(res => res.code === 200 ? res.data : null), catchError(() => of(null)));
  }

  deleteProducto(id: number): Observable<boolean> {
    return this.http
      .get<ApiResponse<any>>(`${this.API}?deleteProducto=${id}`)
      .pipe(map(res => res.code === 200), catchError(() => of(false)));
  }

  // ─── EMPLEADOS ─────────────────────────────────────────────────────────────

  getEmpleados(): Observable<EmployeeRecord[]> {
    return this.http
      .get<ApiResponse<EmployeeRecord[]>>(`${this.API}?getEmpleados`)
      .pipe(map(res => res.code === 200 ? res.data : []), catchError(() => of([])));
  }

  createEmpleado(emp: Omit<EmployeeRecord, 'id'>): Observable<EmployeeRecord | null> {
    return this.http
      .post<ApiResponse<EmployeeRecord>>(`${this.API}?createEmpleado`, emp, { headers: this.headers })
      .pipe(map(res => res.code === 201 ? res.data : null), catchError(() => of(null)));
  }

  updateEmpleado(id: number, emp: Omit<EmployeeRecord, 'id'>): Observable<EmployeeRecord | null> {
    return this.http
      .post<ApiResponse<EmployeeRecord>>(`${this.API}?updateEmpleado=${id}`, emp, { headers: this.headers })
      .pipe(map(res => res.code === 200 ? res.data : null), catchError(() => of(null)));
  }

  deleteEmpleado(id: number): Observable<boolean> {
    return this.http
      .get<ApiResponse<any>>(`${this.API}?deleteEmpleado=${id}`)
      .pipe(map(res => res.code === 200), catchError(() => of(false)));
  }

  // ─── MOVIMIENTOS ───────────────────────────────────────────────────────────

  getMovimientos(tipo?: 'Entrada' | 'Salida'): Observable<InventoryMovement[]> {
    const query = tipo ? `?getMovimientos&tipo=${tipo}` : '?getMovimientos';
    return this.http
      .get<ApiResponse<InventoryMovement[]>>(`${this.API}${query}`)
      .pipe(map(res => res.code === 200 ? res.data : []), catchError(() => of([])));
  }

  createMovimiento(payload: CreateMovimientoPayload): Observable<ApiResponse<any>> {
    return this.http
      .post<ApiResponse<any>>(`${this.API}?createMovimiento`, payload, { headers: this.headers })
      .pipe(catchError(() => of({ code: 500, data: { message: 'Error de conexión.' } })));
  }

  // ─── INVENTARIO ADMINISTRADOR / EMPLEADO ────────────────────────────────────

  getInventarioAdmin(): Observable<InventoryProduct[]> {
    return this.http
      .get<ApiResponse<InventoryProduct[]>>(`${this.API}?getInventarioAdmin`)
      .pipe(map(res => res.code === 200 ? res.data : []), catchError(() => of([])));
  }

  getInventarioEmpleado(employeeId: number): Observable<EmployeeInventoryProduct[]> {
    return this.http
      .get<ApiResponse<EmployeeInventoryProduct[]>>(`${this.API}?getInventarioEmpleado=${employeeId}`)
      .pipe(map(res => res.code === 200 ? res.data : []), catchError(() => of([])));
  }

  getProductosEmpleado(employeeId: number): Observable<EmployeeInventoryProduct[]> {
    return this.http
      .get<ApiResponse<EmployeeInventoryProduct[]>>(`${this.API}?getProductosEmpleado=${employeeId}`)
      .pipe(map(res => res.code === 200 ? res.data : []), catchError(() => of([])));
  }

  supplyEmpleado(payload: SupplyEmployeePayload): Observable<ApiResponse<SupplyEmployeeResponse>> {
    return this.http
      .post<ApiResponse<SupplyEmployeeResponse>>(`${this.API}?supplyEmpleado`, payload, { headers: this.headers })
      .pipe(catchError(() => of({ code: 500, data: { message: 'Error de conexión.' } as any })));
  }

  getPendientesEmpleado(employeeId: number): Observable<PendingEmployeeDelivery[]> {
    return this.http
      .get<ApiResponse<PendingEmployeeDelivery[]>>(`${this.API}?getPendientesEmpleado=${employeeId}`)
      .pipe(map(res => res.code === 200 ? res.data : []), catchError(() => of([])));
  }

  aceptarEntrega(deliveryId: number): Observable<ApiResponse<DeliveryResponse>> {
    return this.http
      .post<ApiResponse<DeliveryResponse>>(`${this.API}?aceptarEntrega`, { entregaId: deliveryId }, { headers: this.headers })
      .pipe(catchError(() => of({ code: 500, data: { message: 'Error de conexión.' } as any })));
  }

  rechazarEntrega(deliveryId: number): Observable<ApiResponse<DeliveryResponse>> {
    return this.http
      .post<ApiResponse<DeliveryResponse>>(`${this.API}?rechazarEntrega`, { entregaId: deliveryId }, { headers: this.headers })
      .pipe(catchError(() => of({ code: 500, data: { message: 'Error de conexión.' } as any })));
  }

  ventaEmpleado(payload: SaleEmployeePayload): Observable<ApiResponse<SaleEmployeeResponse>> {
    return this.http
      .post<ApiResponse<SaleEmployeeResponse>>(`${this.API}?ventaEmpleado`, payload, { headers: this.headers })
      .pipe(catchError(() => of({ code: 500, data: { message: 'Error de conexión.' } as any })));
  }
}

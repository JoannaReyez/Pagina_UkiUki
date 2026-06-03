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
}
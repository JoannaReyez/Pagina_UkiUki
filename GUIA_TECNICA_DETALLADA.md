# 📖 Guía Técnica - Integración de Inventario por Empleado

## Índice
1. Arquitectura
2. Flujo de Datos
3. Ejemplos de Uso
4. Extensiones Futuras
5. Troubleshooting

---

## 1. Arquitectura

### Capas

```
┌─────────────────────────────────────────┐
│        UI Components (Views)            │
├─────────────────────────────────────────┤
│  EmployeeReportPage  │  AdminInventory  │
├─────────────────────────────────────────┤
│          StoreService (State)           │
│  - inventoryProducts (Admin)            │
│  - employeeInventory (Employee)         │
├─────────────────────────────────────────┤
│          Http Service (API)             │
│  - getInventarioAdmin()                 │
│  - getInventarioEmpleado()              │
│  - supplyEmpleado()                     │
│  - ventaEmpleado()                      │
├─────────────────────────────────────────┤
│        Backend PHP API                  │
│  - Rutas.php routes                     │
│  - Model/ConnectDB.php methods          │
│  - Database (MySQL)                     │
└─────────────────────────────────────────┘
```

### Inventarios

```
ADMINISTRADOR INVENTORY                  EMPLOYEE INVENTORY
┌──────────────────────────┐            ┌──────────────────────────┐
│ Tabla: productos         │            │ Tabla: empleado_inv      │
├──────────────────────────┤            ├──────────────────────────┤
│ id           : 1         │            │ usuario_id      : 2      │
│ nombre       : "Ramen"   │────────┬─ │ producto_id     : 1      │
│ stock        : 80        │   (1)  │   │ stock           : 20     │
│ precio       : 3.99      │────────┴─ │ status          : Activo │
│ categoria    : "Snacks"  │   (2)     │                          │
└──────────────────────────┘            │ usuario_id      : 3      │
                                        │ producto_id     : 1      │
                                        │ stock           : 15     │
                                        └──────────────────────────┘

Nota: Admin Ramen = 80
      Emp 2 Ramen = 20
      Emp 3 Ramen = 15
      Total:       55 (20 + 15 en manos de empleados)
```

---

## 2. Flujo de Datos

### Empleado Registra Venta

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario (Empleado) en EmployeeReportPage               │
│    selectiona: Producto = "Ramen", Cantidad = 3            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. registerEntry() valida:                                 │
│    - Producto seleccionado ✓                               │
│    - Cantidad > 0 ✓                                        │
│    - Stock disponible (3 <= 20) ✓                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Crea payload:                                           │
│    {                                                        │
│      productId: 1,           ← ID del producto            │
│      employeeId: 2,          ← ID del empleado            │
│      quantity: 3,            ← Unidades a vender          │
│      reason: "Venta mostrador"                            │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. api.ventaEmpleado(payload)                              │
│    POST ?ventaEmpleado                                     │
│                                                             │
│    Backend responde:                                       │
│    {                                                        │
│      code: 201,                                            │
│      data: {                                               │
│        productId: 1,                                       │
│        employeeId: 2,                                      │
│        quantity: 3,                                        │
│        employeeStockBefore: 20,                            │
│        employeeStockAfter: 17,   ← ACTUALIZADO            │
│        updatedEmployeeStock: {                             │
│          employeeId: 2,                                    │
│          productId: 1,                                     │
│          stock: 17,                                        │
│          status: "Activo"                                  │
│        }                                                    │
│      }                                                      │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Frontend actualiza Store:                               │
│    store.updateEmployeeInventoryProduct(                   │
│      employeeId: 2,                                        │
│      productId: 1,                                         │
│      stock: 17,                                            │
│      status: "Activo"                                      │
│    )                                                        │
│                                                             │
│    store.employeeInventory se actualiza                    │
│    localStorage['ukiuki.employeeInventory'] se sincroniza  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. UI se actualiza automáticamente:                        │
│    - Stock mostrado: 20 → 17                               │
│    - Mensaje: "Venta registrada: 3 unidades de Ramen"     │
│    - Se agrega movimiento al historial                     │
└─────────────────────────────────────────────────────────────┘

STATE ANTES:                    STATE DESPUÉS:
─────────────────────────      ─────────────────────────
adminInventory:                adminInventory:
  - Ramen: 80 (sin cambio)       - Ramen: 80 (sin cambio)

employeeInventory:             employeeInventory:
  - Emp2 Ramen: 20              - Emp2 Ramen: 17 ✓
  - Emp3 Ramen: 15              - Emp3 Ramen: 15

Total sistema: 75 ✗            Total sistema: 72 ✓
```

### Administrador Surtida

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Admin accede a tab "Surtir a empleado"                  │
│    y hace clic en "Crear nuevo surtido"                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Modal abre con selectors:                               │
│    - Empleado: [dropdown]                                  │
│    - Producto: [dropdown]                                  │
│    - Cantidad: [input number]                              │
│    - Motivo: [textarea]                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Admin selecciona:                                       │
│    - Empleado: "Juan García" (ID: 2)                      │
│    - Producto: "Ramen" (ID: 1)                             │
│    - Cantidad: 30                                          │
│    - Motivo: "Surtido semanal"                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. saveSupply() valida:                                    │
│    - Empleado seleccionado ✓                               │
│    - Producto seleccionado ✓                               │
│    - Cantidad > 0 (30 > 0) ✓                               │
│    - Stock admin suficiente (30 <= 80) ✓                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Crea payload:                                           │
│    {                                                        │
│      productId: 1,                                         │
│      employeeId: 2,                                        │
│      quantity: 30,                                         │
│      reason: "Surtido semanal"                             │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. api.supplyEmpleado(payload)                             │
│    POST ?supplyEmpleado                                    │
│                                                             │
│    Backend:                                                │
│    - Admin Ramen: 80 → 50 (reduce 30)                     │
│    - Emp2 Ramen: 0 → 30 (suma 30)                         │
│    - Crea movimiento: "Entrada"                            │
│                                                             │
│    Responde:                                               │
│    {                                                        │
│      code: 201,                                            │
│      data: {                                               │
│        adminStockBefore: 80,                               │
│        adminStockAfter: 50,   ← ADMIN REDUCE              │
│        employeeStockBefore: 0,                             │
│        employeeStockAfter: 30, ← EMP SUMA                 │
│        updatedProduct: {                                   │
│          id: 1,                                            │
│          stock: 50,                                        │
│          status: "Activo"                                  │
│        },                                                   │
│        updatedEmployeeStock: {                             │
│          stock: 30,                                        │
│          status: "Activo"                                  │
│        }                                                    │
│      }                                                      │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Frontend actualiza ambos inventarios:                   │
│    store.inventoryProducts: Ramen 80 → 50                  │
│    Modal se cierra                                         │
│    Swal muestra: "¡Surtido registrado!"                    │
└─────────────────────────────────────────────────────────────┘

STATE ANTES:                    STATE DESPUÉS:
─────────────────────────      ─────────────────────────
adminInventory:                adminInventory:
  - Ramen: 80                    - Ramen: 50 ✓ (reduce)

employeeInventory:             employeeInventory:
  - Emp2 Ramen: 0                - Emp2 Ramen: 30 ✓ (suma)
  - Emp3 Ramen: 15               - Emp3 Ramen: 15

Total sistema: 95 ✓            Total sistema: 95 ✓
```

---

## 3. Ejemplos de Uso

### Ejemplo 1: Cargar Inventario del Empleado

```typescript
// En employee-report.ts

export class EmployeeReportPage implements OnInit {
  constructor(
    public auth: AuthService,
    public store: StoreService,
    private api: Http
  ) {}

  ngOnInit(): void {
    const user = this.auth.user();
    if (user && user.id) {
      // Cargar el inventario personal del empleado
      this.loadEmployeeInventory(Number(user.id));
    }
  }

  private loadEmployeeInventory(employeeId: number): void {
    this.loadingInventory.set(true);
    this.api.getInventarioEmpleado(employeeId).subscribe({
      next: (products) => {
        // Guardar en store (y localStorage automáticamente)
        this.store.employeeInventory.set(products);
        this.loadingInventory.set(false);
      },
      error: () => {
        this.loadingInventory.set(false);
        this.showEntryMessage('Error al cargar inventario', 'error');
      }
    });
  }
}
```

### Ejemplo 2: Registrar Venta

```typescript
// En employee-report.ts

registerEntry(): void {
  const user = this.auth.user();
  const product = this.selectedProduct();
  const quantity = this.entryQuantity();

  // Validar
  if (!product || quantity < 1) return;

  // Crear payload con los datos del empleado
  const payload = {
    productId: product.productId,  // ⚠️ Usar productId, no id
    employeeId: Number(user.id),   // ID del empleado logueado
    quantity,
    reason: this.entryReason()
  };

  // Consumir endpoint de venta
  this.api.ventaEmpleado(payload).subscribe({
    next: (res) => {
      if (res.code === 201) {
        const data = res.data;
        
        // Actualizar stock en store
        this.store.updateEmployeeInventoryProduct(
          data.updatedEmployeeStock.employeeId,
          data.updatedEmployeeStock.productId,
          data.updatedEmployeeStock.stock,
          data.updatedEmployeeStock.status
        );
        
        // Agregar movimiento
        this.store.addMovement({
          id: /* generar ID */,
          type: 'Salida',
          productId: product.productId,
          product: product.name,
          quantity: data.quantity,
          stockBefore: data.employeeStockBefore,
          stockAfter: data.employeeStockAfter,
          reason: payload.reason,
          userId: Number(user.id),
          userName: user.name,
          date: new Date().toLocaleDateString('es-MX')
        });
        
        this.showEntryMessage('Venta registrada correctamente', 'success');
      }
    },
    error: () => {
      this.showEntryMessage('Error al registrar venta', 'error');
    }
  });
}
```

### Ejemplo 3: Surtir a Empleado

```typescript
// En admin-inventory.ts

saveSupply(): void {
  // Validaciones
  if (!this.supplyForm.employeeId || 
      !this.supplyForm.productId || 
      this.supplyForm.quantity < 1) {
    this.supplyFormError.set('Completa todos los campos');
    return;
  }

  const product = this.allProducts().find(p => p.id === this.supplyForm.productId);
  
  if (product.stock < this.supplyForm.quantity) {
    this.supplyFormError.set(`Stock insuficiente: ${product.stock}`);
    return;
  }

  // Crear payload
  const payload = {
    productId: this.supplyForm.productId,
    employeeId: this.supplyForm.employeeId,
    quantity: this.supplyForm.quantity,
    reason: this.supplyForm.reason || 'Surtido del administrador'
  };

  this.supplyLoading.set(true);

  // Consumir endpoint de surtida
  this.httpService.supplyEmpleado(payload).subscribe({
    next: (res) => {
      this.supplyLoading.set(false);
      
      if (res.code === 201) {
        const data = res.data;
        
        // Actualizar stock del admin en inventoryProducts
        this.allProducts.update(list =>
          list.map(p => 
            p.id === data.updatedProduct.id 
              ? { ...p, stock: data.updatedProduct.stock, status: data.updatedProduct.status }
              : p
          )
        );
        
        this.supplyModalOpen.set(false);
        
        // Mostrar notificación
        Swal.fire({
          icon: 'success',
          title: '¡Surtido registrado!',
          html: `<strong>${product.name}</strong><br>
                 Cantidad: ${data.quantity}<br>
                 Stock Admin: ${data.adminStockBefore} → ${data.adminStockAfter}`,
          timer: 3000
        });
      }
    },
    error: () => {
      this.supplyLoading.set(false);
      this.supplyFormError.set('Error de conexión');
    }
  });
}
```

---

## 4. Extensiones Futuras

### A. Dashboard de Empleados

```typescript
// Nuevo componente: admin-dashboard-empleados

export class AdminDashboardEmpleados {
  employees = signal<EmployeeRecord[]>([]);
  employeeInventories = signal<Map<number, EmployeeInventoryProduct[]>>(new Map());

  loadEmployeeInventories(): void {
    this.employees().forEach(emp => {
      this.api.getInventarioEmpleado(emp.id).subscribe(products => {
        this.employeeInventories.update(map => {
          map.set(emp.id, products);
          return map;
        });
      });
    });
  }

  getEmployeeTotal(employeeId: number): number {
    const products = this.employeeInventories().get(employeeId) || [];
    return products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  }
}
```

### B. Devoluciones de Inventario

```typescript
// Nuevo endpoint en backend: ?devolverEmpleado

interface ReturnEmployeePayload {
  productId: number;
  employeeId: number;
  quantity: number;
  reason: string;
}

// En http.ts
returnEmpleado(payload: ReturnEmployeePayload): Observable<ApiResponse<any>> {
  return this.http.post(`${this.API}?devolverEmpleado`, payload, { headers: this.headers });
}
```

### C. Alertas de Stock Bajo

```typescript
// Computed para alertas
readonly employeeLowStockAlerts = computed(() => {
  return this.store.employeeInventory()
    .filter(p => p.stock <= 5);
});
```

### D. Reportes por Empleado

```typescript
// Generar reporte de ventas por empleado
getEmployeeSalesReport(employeeId: number): void {
  const movements = this.store.inventoryMovements()
    .filter(m => m.userId === employeeId && m.type === 'Salida');
  
  const totalUnits = movements.reduce((sum, m) => sum + m.quantity, 0);
  const totalRevenue = movements.reduce((sum, m) => {
    const price = /* obtener precio del producto */;
    return sum + (m.quantity * price);
  }, 0);

  console.log(`Empleado ${employeeId}:
    - Unidades vendidas: ${totalUnits}
    - Ingresos estimados: $${totalRevenue}
  `);
}
```

---

## 5. Troubleshooting

### P1: El empleado ve todos los productos del admin

**Causa:** Frontend carga `store.inventoryProducts()` en lugar de `store.employeeInventory()`

**Solución:**
```typescript
// ❌ MALO
<option *ngFor="let product of store.inventoryProducts()">

// ✅ CORRECTO
<option *ngFor="let product of employeeProducts()">
```

### P2: El stock del admin se reduce cuando el empleado vende

**Causa:** Endpoint `ventaEmpleado` no está separando los inventarios

**Solución (Backend PHP):**
```php
// ✅ Correcto
private function saveEmpleadoInventario($employeeId, $productId, $stock) {
  // Solo actualiza empleado_inventario, NO productos
  $this->mysqli->query(
    "UPDATE empleado_inventario
     SET stock = $stock
     WHERE usuario_id = $employeeId AND producto_id = $productId"
  );
}
```

### P3: El empleado no ve productos después de surtida

**Causa:** No se recargan productos del empleado después de surtida

**Solución:**
```typescript
// Después de saveSupply() exitoso
this.loadEmployeeInventory(this.auth.user().id);
```

### P4: localStorage lleno (cuota excedida)

**Causa:** Demasiados productos o movimientos guardados

**Solución:**
```typescript
// Limpiar localStorage viejo
localStorage.removeItem('ukiuki.inventoryMovements');

// O limitar a últimos 100 movimientos
const movements = this.store.inventoryMovements().slice(0, 100);
localStorage.setItem('ukiuki.inventoryMovements', JSON.stringify(movements));
```

### P5: CORS error al consumir API

**Causa:** Backend no tiene CORS habilitado

**Solución (Backend PHP):**
```php
// En ser_cors.php
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Origin: *');
```

### P6: IDs de producto no coinciden entre admin e inventario del empleado

**Causa:** Nombres inconsistentes (`id` vs `productId`)

**Solución:**
```typescript
// Siempre usar `productId` para empleados
product.productId  // ✅
product.id         // ❌ (solo para admin)
```

---

## Conclusión

La integración está completa y lista para usar. El sistema mantiene:
- ✅ Inventario admin separado e intacto
- ✅ Inventario empleado independiente
- ✅ Historial centralizado
- ✅ Validaciones en frontend y backend
- ✅ Persistencia en localStorage
- ✅ UI/UX mejorada

Para preguntas adicionales, consulta `INTEGRACION_INVENTARIO_EMPLEADO.md`

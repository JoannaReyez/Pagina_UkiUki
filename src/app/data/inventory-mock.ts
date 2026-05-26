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

export interface InventoryMovement {
  id: number;
  type: 'Entrada' | 'Salida';
  product: string;
  quantity: number;
  date: string;
  reason: string;
}

export interface EmployeeRecord {
  id: number;
  name: string;
  email: string;
  role: 'employee';
  status: 'Activo' | 'Inactivo';
  activity: string;
  avatarText: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  caption: string;
  accent: 'pink' | 'yellow' | 'green' | 'purple';
}

export const inventoryMetrics: DashboardMetric[] = [
  { label: 'Productos', value: '256', caption: 'Activos', accent: 'pink' },
  { label: 'Stock total', value: '1,248', caption: 'Unidades', accent: 'yellow' },
  { label: 'Categorías', value: '12', caption: 'Registradas', accent: 'green' },
  { label: 'Empleados', value: '8', caption: 'Activos', accent: 'purple' }
];

export const inventoryCategories: InventoryCategory[] = [
  { id: 1, name: 'Snacks', description: 'Productos para consumo rápido', productsCount: 42, active: true },
  { id: 2, name: 'Bebidas', description: 'Refrescos y bebidas especiales', productsCount: 28, active: true },
  { id: 3, name: 'Congelados', description: 'Productos refrigerados y frozen', productsCount: 16, active: true },
  { id: 4, name: 'Promociones', description: 'Ofertas y bundles', productsCount: 8, active: true }
];

export const inventoryProducts: InventoryProduct[] = [
  { id: 1, image: '/koro1.png', name: 'Buldak Hot Chicken Ramen', price: 189, stock: 5, description: 'Ramen picante premium', category: 'Snacks', status: 'Bajo stock' },
  { id: 2, image: '/koro2.png', name: 'Melon Soda', price: 89, stock: 6, description: 'Bebida refrescante', category: 'Bebidas', status: 'Bajo stock' },
  { id: 3, image: '/koro3.png', name: 'Pepero Original', price: 69, stock: 8, description: 'Snack clásico coreano', category: 'Snacks', status: 'Bajo stock' },
  { id: 4, image: '/koro4.png', name: 'Mochi Box', price: 149, stock: 24, description: 'Caja surtida de mochi', category: 'Promociones', status: 'Activo' },
  { id: 5, image: '/koro6.png', name: 'Binggrae Milk', price: 54, stock: 36, description: 'Leche saborizada', category: 'Bebidas', status: 'Activo' }
];

export const inventoryMovements: InventoryMovement[] = [
  { id: 1, type: 'Entrada', product: 'Buldak Hot Chicken Ramen', quantity: 120, date: '12 may 2026', reason: 'Reposición semanal' },
  { id: 2, type: 'Salida', product: 'Melon Soda', quantity: 18, date: '13 may 2026', reason: 'Ventas del día' },
  { id: 3, type: 'Salida', product: 'Pepero Original', quantity: 22, date: '14 may 2026', reason: 'Venta promo' },
  { id: 4, type: 'Entrada', product: 'Mochi Box', quantity: 60, date: '15 may 2026', reason: 'Nuevo lote' }
];

export const employeeRecords: EmployeeRecord[] = [
  { id: 1, name: 'Empleado 1', email: 'empleado@empleado.com', role: 'employee', status: 'Activo', activity: '15 ventas registradas hoy', avatarText: 'EM' },
  { id: 2, name: 'Ana Lopez', email: 'ana@empresa.com', role: 'employee', status: 'Activo', activity: 'Inventario actualizado hace 20 min', avatarText: 'AL' },
  { id: 3, name: 'Carlos Ruiz', email: 'carlos@empresa.com', role: 'employee', status: 'Inactivo', activity: 'Sin actividad reciente', avatarText: 'CR' }
];

export const adminReportSummary = [
  { label: 'Ventas hoy', value: '$12,480', caption: '+14% vs ayer' },
  { label: 'Productos vendidos', value: '248', caption: 'Últimas 24h' },
  { label: 'Stock crítico', value: '3', caption: 'Requiere acción' },
  { label: 'Actividades', value: '18', caption: 'Eventos recientes' }
];

export const employeeReportSummary = [
  { label: 'Vendidos hoy', value: '31', caption: 'Piezas registradas' },
  { label: 'Total vendido', value: '$2,180', caption: 'Mi reporte' },
  { label: 'Movimientos', value: '12', caption: 'Entradas y salidas' }
];

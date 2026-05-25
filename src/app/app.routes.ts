import { Routes } from '@angular/router';
import { Home } from '../component/home/home';
import { Productos } from '../component/productos/productos';
import { ProductDetail } from '../component/product-detail/product-detail';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { EmployeeLayout } from './layouts/employee-layout/employee-layout';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';
import { AdminDashboardPage } from './pages/admin/admin-dashboard/admin-dashboard';
import { AdminProductsPage } from './pages/admin/admin-products/admin-products';
import { AdminCategoriesPage } from './pages/admin/admin-categories/admin-categories';
import { AdminInventoryPage } from './pages/admin/admin-inventory/admin-inventory';
import { AdminEmployeesPage } from './pages/admin/admin-employees/admin-employees';
import { AdminReportsPage } from './pages/admin/admin-reports/admin-reports';
import { AdminSettingsPage } from './pages/admin/admin-settings/admin-settings';
import { EmployeeDashboardPage } from './pages/employee/employee-dashboard/employee-dashboard';
import { EmployeeProductsPage } from './pages/employee/employee-products/employee-products';
import { EmployeeCategoriesPage } from './pages/employee/employee-categories/employee-categories';
import { EmployeeReportPage } from './pages/employee/employee-report/employee-report';

export const routes: Routes = [
  { path: '', redirectTo: 'web', pathMatch: 'full' },
  { path: 'web', component: Home },
  { path: 'productos', component: Productos },
  { path: 'producto/:id', component: ProductDetail },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],
    canMatch: [roleGuard('admin')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardPage },
      { path: 'productos', component: AdminProductsPage },
      { path: 'categorias', component: AdminCategoriesPage },
      { path: 'inventario', component: AdminInventoryPage },
      { path: 'empleados', component: AdminEmployeesPage },
      { path: 'reportes', component: AdminReportsPage },
      { path: 'ajustes', component: AdminSettingsPage }
    ]
  },
  {
    path: 'empleado',
    component: EmployeeLayout,
    canActivate: [authGuard],
    canMatch: [roleGuard('employee')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: EmployeeDashboardPage },
      { path: 'productos', component: EmployeeProductsPage },
      { path: 'categorias', component: EmployeeCategoriesPage },
      { path: 'mi-reporte', component: EmployeeReportPage }
    ]
  }
];

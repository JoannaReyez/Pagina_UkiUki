import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { StoreService } from '../../store.service';

@Component({
  selector: 'app-employee-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './employee-layout.html',
  styleUrl: './employee-layout.scss'
})
export class EmployeeLayout {
  readonly sidebarOpen = signal(true);

  readonly menuItems = [
    { path: '/empleado', label: 'Dashboard', icon: 'bi-grid-1x2' },
    { path: '/empleado/productos', label: 'Productos', icon: 'bi-box-seam' },
    { path: '/empleado/categorias', label: 'Categorias', icon: 'bi-tags' },
    { path: '/empleado/mi-reporte', label: 'Mi Reporte', icon: 'bi-file-earmark-text' }
  ];

  constructor(
    public auth: AuthService,
    public store: StoreService,
    public router: Router
  ) {}

  toggleSidebar(): void {
    this.sidebarOpen.update(current => !current);
  }

  closeSidebar(): void {
    if (window.innerWidth <= 1180) {
      this.sidebarOpen.set(false);
    }
  }

  logout(): void {
    this.auth.logout();
    this.store.logout();
    this.router.navigate(['/web']);
  }
}

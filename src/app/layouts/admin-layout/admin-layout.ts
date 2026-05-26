import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { StoreService } from '../../store.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayout {
  private readonly destroyRef = inject(DestroyRef);
  readonly sidebarOpen = signal(true);

  readonly menuItems = [
    { path: '/admin', label: 'Dashboard', icon: 'bi-grid-1x2' },
    { path: '/admin/productos', label: 'Productos', icon: 'bi-box-seam' },
    { path: '/admin/categorias', label: 'Categorías', icon: 'bi-tags' },
    { path: '/admin/inventario', label: 'Inventario', icon: 'bi-archive' },
    { path: '/admin/empleados', label: 'Empleados', icon: 'bi-people' },
    { path: '/admin/reportes', label: 'Reportes', icon: 'bi-graph-up-arrow' },
    { path: '/admin/ajustes', label: 'Ajustes', icon: 'bi-gear' }
  ];

  constructor(
    public auth: AuthService,
    public store: StoreService,
    public router: Router
  ) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        if (window.innerWidth < 1024) {
          this.sidebarOpen.set(false);
        }
      });
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(current => !current);
  }

  logout(): void {
    this.auth.logout();
    this.store.logout();
    this.router.navigate(['/web']);
  }
}

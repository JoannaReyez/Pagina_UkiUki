import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LoginModal } from '../../modales/login-modal/login-modal';
import { StoreService } from '../../app/store.service';
import { AuthService } from '../../app/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LoginModal],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  constructor(
    private router: Router,
    public store: StoreService,
    public auth: AuthService
  ) {}

  isScrolled = false;
  menuOpen = false;
  showLoginModal = false;

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 80;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  openLoginModal(): void {
    this.closeMenu();
    this.showLoginModal = true;
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
  }

  handleLogin(_credentials: { email: string; password: string; role?: string }): void {
    this.closeMenu();
  }

  handleLogout(): void {
    this.store.logout();
    this.auth.logout();
    this.closeMenu();
    this.router.navigate(['/web']);
  }
}

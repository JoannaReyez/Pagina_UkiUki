import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LoginModal } from '../../modales/login-modal/login-modal';
import { StoreService } from '../../app/store.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LoginModal],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  constructor(private router: Router, public store: StoreService) {}

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

  handleLogin(credentials: { email: string; password: string }): void {
    const loggedIn = this.store.login(credentials.email, credentials.password);
    if (!loggedIn) {
      return;
    }

    this.closeMenu();
    this.router.navigate(['/usuario/dashboard']);
  }

  handleLogout(): void {
    this.store.logout();
    this.closeMenu();
    this.router.navigate(['/web']);
  }
}

import { Component, Output, EventEmitter, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StoreService } from '../../app/store.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.scss',
})
export class LoginModal {
  @Output() close = new EventEmitter<void>();
  @Output() login = new EventEmitter<{ email: string; password: string; role: string }>();

  private router = inject(Router);
  private store = inject(StoreService);

  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  isLoading = false;
  loginError = '';

  @HostListener('document:keydown.escape')
  onEscapePress() {
    this.closeModal();
  }

  onSubmit() {
    if (!this.email || !this.password) {
      return;
    }

    this.isLoading = true;
    this.loginError = '';

    setTimeout(() => {
      const result = this.store.login(this.email, this.password);

      if (result.success) {
        this.login.emit({ email: this.email, password: this.password, role: result.role });
        this.router.navigate(['/productos']);
        this.closeModal();
      } else {
        this.loginError = 'Usuario o contrasena incorrectos.';
      }

      this.isLoading = false;
    }, 800);
  }

  closeModal() {
    this.close.emit();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}

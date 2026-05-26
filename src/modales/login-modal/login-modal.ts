import { Component, Output, EventEmitter, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../app/auth/auth.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.scss',
})
export class LoginModal {
  @Output() close = new EventEmitter<void>();
  @Output() login = new EventEmitter<{ email: string; password: string; role: 'admin' | 'employee' }>();

  private router = inject(Router);
  private auth = inject(AuthService);

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
      const result = this.auth.login(this.email, this.password);

      if (result.success) {
        const role = result.role ?? 'employee';
        this.login.emit({ email: this.email, password: this.password, role });
        this.router.navigate([role === 'admin' ? '/admin' : '/empleado']);
        this.closeModal();
      } else {
        this.loginError = result.message ?? 'Usuario o contrasena incorrectos.';
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

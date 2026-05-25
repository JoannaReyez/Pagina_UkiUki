import { Injectable, computed, signal } from '@angular/core';
import { AuthRole, AuthSession, AuthUser, LoginResult } from './auth.models';

const SESSION_KEY = 'ukiuki_auth_session';

const authUsers: Record<string, { password: string; user: AuthUser }> = {
  'admin@admin.com': {
    password: 'admin123',
    user: {
      id: 'admin-1',
      name: 'Admin',
      email: 'admin@admin.com',
      role: 'admin',
      avatarText: 'AD'
    }
  },
  'empleado@empleado.com': {
    password: 'empleado123',
    user: {
      id: 'employee-1',
      name: 'Empleado',
      email: 'empleado@empleado.com',
      role: 'employee',
      avatarText: 'EM'
    }
  }
};

function readSession(): AuthSession {
  if (typeof localStorage === 'undefined') {
    return { isAuthenticated: false, role: null, user: null };
  }

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return { isAuthenticated: false, role: null, user: null };
    }

    return JSON.parse(raw) as AuthSession;
  } catch {
    return { isAuthenticated: false, role: null, user: null };
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session = signal<AuthSession>(readSession());

  readonly isAuthenticated = computed(() => this.session().isAuthenticated);
  readonly role = computed(() => this.session().role);
  readonly user = computed(() => this.session().user);
  readonly isAdmin = computed(() => this.session().role === 'admin');
  readonly isEmployee = computed(() => this.session().role === 'employee');

  login(email: string, password: string): LoginResult {
    const key = email.trim().toLowerCase();
    const record = authUsers[key];

    if (!record || record.password !== password) {
      return {
        success: false,
        role: null,
        message: 'Credenciales incorrectas.'
      };
    }

    const session: AuthSession = {
      isAuthenticated: true,
      role: record.user.role,
      user: record.user
    };

    this.setSession(session);
    return {
      success: true,
      role: record.user.role,
      user: record.user
    };
  }

  logout(): void {
    this.setSession({ isAuthenticated: false, role: null, user: null });
  }

  hasRole(role: AuthRole): boolean {
    return this.session().role === role;
  }

  private setSession(session: AuthSession): void {
    this.session.set(session);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  }
}

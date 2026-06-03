import { Injectable, computed, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { AuthRole, AuthSession, AuthUser, LoginResult } from './auth.models';

const SESSION_KEY = 'ukiuki_auth_session';
const API_URL = 'http://localhost/kui.kui/Rutas.php';

function readSession(): AuthSession {
  if (typeof localStorage === 'undefined') {
    return { isAuthenticated: false, role: null, user: null };
  }
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : { isAuthenticated: false, role: null, user: null };
  } catch {
    return { isAuthenticated: false, role: null, user: null };
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session = signal<AuthSession>(readSession());

  readonly isAuthenticated = computed(() => this.session().isAuthenticated);
  readonly role            = computed(() => this.session().role);
  readonly user            = computed(() => this.session().user);
  readonly isAdmin         = computed(() => this.session().role === 'admin');
  readonly isEmployee      = computed(() => this.session().role === 'employee');

  private readonly headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResult> {
    return this.http
      .post<{ code: number; data: any }>(
        `${API_URL}?login`,
        { email, password },
        { headers: this.headers }
      )
      .pipe(
        map((res) => {
          if (res.code === 200) {
            const user: AuthUser = {
              id:         res.data.id,
              name:       res.data.name,
              email:      res.data.email,
              role:       res.data.role as Exclude<AuthRole, null>,
              avatarText: res.data.avatarText
            };
            const session: AuthSession = {
              isAuthenticated: true,
              role: user.role,
              user
            };
            this.setSession(session);
            return { success: true, role: user.role, user };
          }
          return {
            success: false,
            role: null as AuthRole,
            message: res.data?.message ?? 'Credenciales incorrectas.'
          };
        }),
        catchError(() =>
          of({
            success: false,
            role: null as AuthRole,
            message: 'Error de conexión con el servidor.'
          })
        )
      );
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
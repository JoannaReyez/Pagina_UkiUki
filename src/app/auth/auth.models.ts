export type AuthRole = 'admin' | 'employee' | null;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Exclude<AuthRole, null>;
  avatarText: string;
}

export interface AuthSession {
  isAuthenticated: boolean;
  role: AuthRole;
  user: AuthUser | null;
}

export interface LoginResult {
  success: boolean;
  role: AuthRole;
  user?: AuthUser;
  message?: string;
}

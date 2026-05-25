import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { AuthRole } from './auth.models';
import { AuthService } from './auth.service';

export const roleGuard = (role: AuthRole): CanMatchFn => {
  return (_route: Route, _segments: UrlSegment[]): boolean | UrlTree => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/web']);
    }

    return auth.role() === role ? true : router.createUrlTree([role === 'admin' ? '/admin' : '/empleado']);
  };
};

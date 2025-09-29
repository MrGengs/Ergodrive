import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map(user => {
      if (user) {
        return true; // Pengguna sudah login, izinkan akses
      } else {
        // Pengguna belum login, alihkan ke halaman login
        return router.createUrlTree(['/login']);
      }
    })
  );
};

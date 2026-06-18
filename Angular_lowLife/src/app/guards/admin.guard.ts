import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): boolean {
    const user = this.authService.getUser();

    // Comprueba que el usuario exiuste y tiene rol admin
    if (user && user.rol === 'admin') {
      return true;
    }

    // si no es admin o no está logueado, redirige al index
    this.router.navigate(['/index']);
    return false;
  }
}

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.authService.getUser();
    
    // Check if user exists and has the admin role
    if (user && user.rol === 'admin') {
      return true;
    }

    // If not admin or not logged in, redirect to index
    this.router.navigate(['/index']);
    return false;
  }
}

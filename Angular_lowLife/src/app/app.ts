import { Component, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Angular_lowLife');
  isNavbarOpen: boolean = false;
  isAdminMode: boolean = false;

  constructor(public router: Router, public authService: AuthService, public cartService: CartService) {
    // Close navbar on route change
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isNavbarOpen = false;
        
        if (this.router.url.includes('/admin-')) {
          this.isAdminMode = true;
        } else {
          this.isAdminMode = false;
        }
      }
    });
  }

  isLoginPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/registro';
  }

  /**
   * Comprueba si el usuario logueado tiene el rol de admin
   */
  isAdminUser(): boolean {
    const user = this.authService.getUser();
    return user && user.rol === 'admin';
  }

  /**
   * Obtiene la foto de perfil del usuario si la tiene
   */
  getUserPhoto(): string | null {
    const user = this.authService.getUser();
    return (user && user.foto_perfil) ? user.foto_perfil : null;
  }

  toggleNavbar() {
    this.isNavbarOpen = !this.isNavbarOpen;
  }

  closeNavbar() {
    this.isNavbarOpen = false;
  }

  toggleAdminMode() {
    this.isAdminMode = !this.isAdminMode;
    if (this.isAdminMode) {
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.router.navigate(['/index']);
    }
  }
}

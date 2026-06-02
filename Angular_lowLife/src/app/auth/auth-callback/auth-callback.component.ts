import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-auth-callback',
  standalone: false,
  template: `
    <div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
      <div class="spinner-border text-danger" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Iniciando sesión...</span>
      </div>
      <h3 class="ms-3 mt-2 font-monospace">Completando autenticación con Google...</h3>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Buscar el token en la URL (ej: /auth/callback?token=xxxx)
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        // Guardar el token usando el método correcto
        this.authService.setToken(token);

        // Obtener los datos del usuario usando el token (necesitamos hacer una petición a /user)
        this.http.get('http://localhost:8000/api/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).subscribe({
          next: (user: any) => {
            // Guardar el usuario en localStorage
            this.authService.setUser(user);
            // Redirigir al inicio
            this.router.navigate(['/index']).then(() => {
              window.location.reload(); // Recargar para actualizar el header
            });
          },
          error: (err) => {
            console.error('Error obteniendo usuario', err);
            this.router.navigate(['/login']);
          }
        });
      } else {
        // Si no hay token, volvemos a login
        this.router.navigate(['/login']);
      }
    });
  }
}

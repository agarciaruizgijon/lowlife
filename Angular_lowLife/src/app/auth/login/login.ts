import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  // Objeto para recoger las credenciales del formulario
  credentials = {
    identificador: '',
    password: ''
  };

  // Mensaje de error para mostrar si falla el login
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Si el usuario ya está logueado, no le dejamos ver el login y lo llevamos al catálogo
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/index']);
    }
  }

  /**
   * Se llama al enviar el formulario.
   * Pasa las credenciales al servicio de autenticación.
   */
  onSubmit() {
    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        // Si el login es correcto, llevamos al usuario al catálogo
        this.router.navigate(['/index']);
      },
      error: (err) => {
        // Si hay error (credenciales incorrectas), mostramos el mensaje
        this.errorMessage = 'Nombre de usuario o contraseña incorrectos.';
        console.error(err);
      }
    });
  }

  /**
   * Se llama al hacer clic en "Continuar con Google".
   */
  loginWithGoogle() {
    this.authService.getGoogleAuthUrl().subscribe({
      next: (res) => {
        if (res.url) {
          window.location.href = res.url;
        }
      },
      error: (err) => {
        this.errorMessage = 'No se pudo conectar con Google en este momento.';
        console.error(err);
      }
    });
  }
}

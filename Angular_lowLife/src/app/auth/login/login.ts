import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  credentials = {
    identificador: '',
    password: ''
  };

  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Si el usuario ya está logueado, lo redirigimos al inicio para que no vuelva a loguearse
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/index']);
    }

    // Suscribirse a los parámetros de la URL (query params)
    // Esto nos permite detectar si el usuario viene de pulsar el botón del correo de verificación
    this.route.queryParams.subscribe(params => {
      // Si el parámetro 'verified' es 'success', mostramos un mensaje verde en el login
      if (params['verified'] === 'success') {
        this.successMessage = '¡Tu cuenta ha sido verificada con éxito! Ya puedes iniciar sesión.';
      } 
      // Si el parámetro es 'already', el usuario ya estaba verificado de antes
      else if (params['verified'] === 'already') {
        this.successMessage = 'Tu cuenta ya estaba verificada.';
      } 
      // Si el usuario acaba de registrarse, le pedimos que revise su correo
      else if (params['registered'] === 'true') {
        this.successMessage = '¡Registro exitoso! Por favor, revisa tu correo electrónico para verificar tu cuenta.';
      }
      // Si hay un error (ej: enlace falso o caducado), mostramos el mensaje en rojo
      else if (params['error'] === 'invalid_hash' || params['error'] === 'user_not_found') {
        this.errorMessage = 'El enlace de verificación no es válido o ha caducado.';
      }
    });
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
        // Comprobamos si el backend nos ha devuelto un error de validación
        // y si dentro de esos errores viene el de 'verificacion' (email no verificado)
        if (err.error && err.error.verificacion) {
          this.errorMessage = err.error.verificacion[0];
        } 
        // Si nos devuelve el error de credenciales incorrectas
        else if (err.error && err.error.credenciales) {
          this.errorMessage = err.error.credenciales[0];
        } 
        // Para cualquier otro error genérico
        else {
          this.errorMessage = 'Nombre de usuario o contraseña incorrectos.';
        }
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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  // Objeto para recoger los datos del formulario (como estaba antes)
  userData = {
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  // Variable para mostrar errores si los hay
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Si el usuario ya está logueado, lo llevamos al catálogo para que no pueda registrarse de nuevo
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/index']);
    }
  }

  /**
   * Se llama al enviar el formulario.
   * Valida la contraseña y llama al servicio de autenticación.
   */
  onSubmit() {
    // Comprobamos que las contraseñas coinciden
    if (this.userData.password !== this.userData.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    // Preparamos los datos para enviar al backend (sin el confirmPassword)
    const dataToSend = {
      nombre: this.userData.nombre,
      email: this.userData.email,
      password: this.userData.password
    };

    this.authService.register(dataToSend).subscribe({
      next: (res) => {
        // Si sale bien, redirigimos al login avisando de que tienen que verificar el correo
        this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      },
      error: (err) => {
        // Mejorar la captura de errores para ser específicos
        if (err.status === 422 && err.error && err.error.errors) {
          const errors = err.error.errors;
          let mensajes = [];
          
          if (errors.nombre_usuario) mensajes.push('El nombre de usuario ya está en uso o es inválido.');
          if (errors.email) mensajes.push('El email ya está registrado o no es válido.');
          if (errors.password) mensajes.push('La contraseña debe tener al menos 8 caracteres.');
          
          this.errorMessage = mensajes.length > 0 ? mensajes.join(' ') : 'Los datos introducidos no son válidos.';
        } else {
          this.errorMessage = 'Error al registrar. Revisa tu conexión o inténtalo más tarde.';
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

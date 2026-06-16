import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URL base de nuestra API en Laravel
  private apiUrl = 'https://ruix.iesruizgijon.es/agarcia/laravel/public/api';

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Método para registrar un nuevo usuario.
   * Envía los datos al endpoint /register de Laravel.
   * @param userData Los datos del formulario de registro (nombre, password, etc)
   */
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, userData).pipe(
      // 'tap' nos permite ejecutar código secundario si la petición tiene éxito sin modificar la respuesta
      tap((response: any) => {
        // Si el registro devuelve un token, lo guardamos para auto-loguear al usuario
        // Actualizado para buscar access_token (como devuelve ahora el backend) o token (legacy)
        const tokenToSave = response.access_token || response.token;
        if (tokenToSave) {
          this.setToken(tokenToSave);
          this.setUser(response.usuario);
        }
      })
    );
  }

  /**
   * Método para iniciar sesión.
   * Envía las credenciales al endpoint /login de Laravel.
   * @param credentials Objeto con nombre y password
   */
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        // Guardamos el token en localStorage para mantener la sesión
        const tokenToSave = response.access_token || response.token;
        if (tokenToSave) {
          this.setToken(tokenToSave);
          this.setUser(response.usuario);
        }
      })
    );
  }

  /**
   * Obtiene la URL de redirección a Google desde el backend
   */
  getGoogleAuthUrl(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/google/redirect`);
  }

  /**
   * Cierra la sesión del usuario actual.
   * Llama al endpoint de logout (opcional) y luego limpia el localStorage.
   */
  logout() {
    // Si quisieras llamar al backend para destruir el token, harías un this.http.post aquí.
    // Por ahora, simplemente limpiamos el almacenamiento local.
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirigimos al inicio o al login
    this.router.navigate(['/login']);
  }

  /**
   * Envía los datos actualizados del perfil al backend.
   * Usamos FormData porque puede incluir un archivo (imagen de perfil).
   */
  updateProfile(formData: FormData): Observable<any> {
    // Necesitamos enviar el token para acceder a la ruta protegida
    const token = this.getToken();
    return this.http.post(`${this.apiUrl}/perfil/actualizar`, formData, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap((response: any) => {
        if (response.usuario) {
          // Si todo va bien, actualizamos el localStorage con los nuevos datos
          this.setUser(response.usuario);
        }
      })
    );
  }

  /**
   * Comprueba si el usuario está actualmente logueado.
   * Lo hace verificando si existe un token guardado.
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Guarda el token en el almacenamiento local (localStorage).
   */
  public setToken(token: string) {
    localStorage.setItem('token', token);
  }

  /**
   * Obtiene el token actual del almacenamiento local.
   */
  public getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Guarda los datos del usuario (sin datos sensibles como la contraseña) en localStorage.
   */
  public setUser(user: any) {
    // Lo convertimos a string porque localStorage solo guarda texto
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Obtiene los datos del usuario logueado en formato de objeto.
   */
  public getUser(): any {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }
}

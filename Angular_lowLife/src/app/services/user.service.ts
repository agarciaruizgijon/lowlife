import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // URL base de la API para usuarios
  private apiUrl = 'https://ruix.iesruizgijon.es/agarcia/laravel/public/api/usuarios';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de todos los usuarios desde el backend.
   * @returns Observable con el array de usuarios.
   */
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * Obtiene un usuario específico por su ID.
   * @param id ID del usuario a buscar.
   * @returns Observable con los datos del usuario.
   */
  getUser(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Actualiza los datos de un usuario específico.
   * @param id ID del usuario a actualizar.
   * @param data Objeto con los datos modificados.
   * @returns Observable con la respuesta del servidor.
   */
  updateUser(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Actualiza los datos de un usuario incluyendo archivos (como la foto de perfil).
   * Usa POST con _method=PUT porque PHP/Laravel no lee FormData en peticiones PUT directas.
   * @param id ID del usuario a actualizar.
   * @param formData FormData con los datos y archivos.
   * @returns Observable con la respuesta del servidor.
   */
  updateUserWithFile(id: number, formData: FormData): Observable<any> {
    formData.append('_method', 'PUT');
    return this.http.post<any>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Elimina un usuario por su ID.
   * @param id ID del usuario a eliminar.
   * @returns Observable con la respuesta del servidor.
   */
  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

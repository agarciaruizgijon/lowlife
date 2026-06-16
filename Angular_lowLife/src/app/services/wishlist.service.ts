import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private apiUrl = 'https://ruix.iesruizgijon.es/agarcia/laravel/public/api/deseados';

  constructor(private http: HttpClient, private authService: AuthService) { }

  /**
   * Comentario: Obtiene la lista de deseados del usuario logueado
   */
  getWishlist(): Observable<any[]> {
    const token = this.authService.getToken();
    if (!token) return throwError(() => new Error('No autorizado'));

    return this.http.get<any[]>(this.apiUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  /**
   * Comentario: Alterna el like (añade o quita) de un producto
   */
  toggleLike(productoId: number): Observable<any> {
    const token = this.authService.getToken();
    if (!token) return throwError(() => new Error('No autorizado'));

    return this.http.post<any>(`${this.apiUrl}/toggle`, { producto_id: productoId }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}

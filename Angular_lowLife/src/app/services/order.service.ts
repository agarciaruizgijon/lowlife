import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8000/api/mis-pedidos';

  constructor(private http: HttpClient, private authService: AuthService) { }

  /**
   * Comentario: Obtiene el historial de pedidos del usuario logueado
   */
  getMyOrders(): Observable<any[]> {
    const token = this.authService.getToken();
    if (!token) return throwError(() => new Error('No autorizado'));

    return this.http.get<any[]>(this.apiUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}

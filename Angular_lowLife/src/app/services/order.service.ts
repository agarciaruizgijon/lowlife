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

  /**
   * Crea un nuevo pedido con los datos de envío y el total.
   */
  placeOrder(orderData: any): Observable<any> {
    const token = this.authService.getToken();
    if (!token) return throwError(() => new Error('No autorizado'));

    return this.http.post<any>('http://localhost:8000/api/pedidos', orderData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  /**
   * Comentario añadido:

   * Obtiene la lista completa de todos los pedidos registrados en el sistema.
   * A diferencia de getMyOrders(), este método no filtra por usuario.
   * Se utiliza en el panel de control del Administrador para calcular ventas totales y mostrar pedidos recientes.
   */
  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8000/api/pedidos');
  }

  /**
   * Obtiene los detalles de un pedido específico por su ID.
   * Se utiliza en la vista de edición de pedidos del Administrador.
   */
  getOrderById(id: number | string): Observable<any> {
    return this.http.get<any>(`http://localhost:8000/api/pedidos/${id}`);
  }

  /**
   * Actualiza los datos de un pedido (ej. estado de procesado).
   */
  updateOrder(id: number | string, data: any): Observable<any> {
    return this.http.put<any>(`http://localhost:8000/api/pedidos/${id}`, data);
  }

  /**
   * Oculta un pedido de la vista del usuario
   */
  hideOrder(id: number | string): Observable<any> {
    const token = this.authService.getToken();
    if (!token) return throwError(() => new Error('No autorizado'));

    return this.http.patch<any>(`http://localhost:8000/api/pedidos/${id}/ocultar`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  /**
   * Elimina definitivamente un pedido del sistema
   */
  deleteOrder(id: number | string): Observable<any> {
    return this.http.delete<any>(`http://localhost:8000/api/pedidos/${id}`);
  }
}

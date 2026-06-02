import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service'; // Importamos el servicio de autenticación

export interface CartItem {
  id: number;
  usuario_id: number;
  producto_id: number;
  cantidad: number;
  producto?: any; // The joined product details
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8000/api/cesta';

  // Inyectamos el AuthService para poder saber quién ha iniciado sesión
  constructor(private http: HttpClient, private authService: AuthService) { }

  /**
   * Obtiene la cesta única del usuario que ha iniciado sesión.
   */
  getCart(): Observable<CartItem[]> {
    // 1. Conseguimos al usuario actualmente logueado
    const user = this.authService.getUser();
    
    // 2. Si hay usuario, hacemos la petición con su ID real, si no, devolvemos un array vacío simulado
    if (user && user.id) {
      return this.http.get<CartItem[]>(`${this.apiUrl}/${user.id}`);
    } else {
      // Retornamos un error o un array vacío si no está logueado
      return throwError(() => new Error('Debes iniciar sesión para ver tu cesta.'));
    }
  }

  /**
   * Añade un producto a la cesta única del usuario que ha iniciado sesión.
   */
  addToCart(productoId: number, cantidad: number = 1): Observable<any> {
    // 1. Conseguimos al usuario
    const user = this.authService.getUser();

    // 2. Si no hay usuario, lanzamos error
    if (!user || !user.id) {
      return throwError(() => new Error('Debes iniciar sesión para añadir productos a la cesta.'));
    }

    // 3. Enviamos la petición al backend con su ID real
    return this.http.post<any>(this.apiUrl, {
      usuario_id: user.id, // ID real en lugar de ID simulado
      producto_id: productoId,
      cantidad: cantidad
    });
  }
}

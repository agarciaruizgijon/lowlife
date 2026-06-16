import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Importamos el servicio de autenticación

export interface CartItem {
  id: number;
  usuario_id: number;
  producto_id: number;
  cantidad: number;
  color?: string;
  talla?: string;
  producto?: any; // The joined product details
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'https://ruix.iesruizgijon.es/agarcia/laravel/public/api/cesta';
  
  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  // Inyectamos el AuthService para poder saber quién ha iniciado sesión
  constructor(private http: HttpClient, private authService: AuthService) {
    this.refreshCartCount();
  }

  /**
   * Obtiene la cesta única del usuario que ha iniciado sesión.
   */
  getCart(): Observable<CartItem[]> {
    // 1. Conseguimos al usuario actualmente logueado
    const user = this.authService.getUser();
    
    // 2. Si hay usuario, hacemos la petición con su ID real, si no, devolvemos un array vacío simulado
    if (user && user.id) {
      return this.http.get<CartItem[]>(`${this.apiUrl}/${user.id}`).pipe(
        tap(cart => {
          const count = cart.reduce((acc, item) => acc + item.cantidad, 0);
          this.cartCountSubject.next(count);
        })
      );
    } else {
      // Retornamos un error o un array vacío si no está logueado
      this.cartCountSubject.next(0);
      return throwError(() => new Error('Debes iniciar sesión para ver tu cesta.'));
    }
  }

  /**
   * Refresca el contador de la cesta consultando el servidor.
   */
  refreshCartCount(): void {
    if (this.authService.isLoggedIn()) {
      this.getCart().subscribe({
        next: () => {},
        error: () => this.cartCountSubject.next(0)
      });
    } else {
      this.cartCountSubject.next(0);
    }
  }

  /**
   * Añade un producto a la cesta única del usuario que ha iniciado sesión.
   */
  addToCart(productoId: number, cantidad: number = 1, color?: string, talla?: string): Observable<any> {
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
      cantidad: cantidad,
      color: color,
      talla: talla
    }).pipe(
      tap(() => this.refreshCartCount())
    );
  }

  /**
   * Elimina un producto de la cesta por su ID de cesta.
   */
  removeFromCart(cestaId: number): Observable<any> {
    const user = this.authService.getUser();
    if (!user || !user.id) {
      return throwError(() => new Error('Debes iniciar sesión para modificar la cesta.'));
    }

    return this.http.delete<any>(`${this.apiUrl}/${cestaId}`).pipe(
      tap(() => this.refreshCartCount())
    );
  }

  /**
   * Actualiza la cantidad de un producto en la cesta.
   */
  updateQuantity(cestaId: number, cantidad: number): Observable<any> {
    const user = this.authService.getUser();
    if (!user || !user.id) {
      return throwError(() => new Error('Debes iniciar sesión para modificar la cesta.'));
    }

    return this.http.put<any>(`${this.apiUrl}/${cestaId}`, { cantidad }).pipe(
      tap(() => this.refreshCartCount())
    );
  }

  /**
   * Vacía toda la cesta del usuario.
   */
  clearCart(): Observable<any> {
    const user = this.authService.getUser();
    if (!user || !user.id) {
      return throwError(() => new Error('Debes iniciar sesión para vaciar la cesta.'));
    }

    return this.http.delete<any>(`${this.apiUrl}/clear/${user.id}`).pipe(
      tap(() => {
        this.cartCountSubject.next(0);
      })
    );
  }
}

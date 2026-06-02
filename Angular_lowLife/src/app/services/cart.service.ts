import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  
  // For now, we mock the user ID as 1
  private mockUserId = 1;

  constructor(private http: HttpClient) { }

  getCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.apiUrl}/${this.mockUserId}`);
  }

  addToCart(productoId: number, cantidad: number = 1): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      usuario_id: this.mockUserId,
      producto_id: productoId,
      cantidad: cantidad
    });
  }
}

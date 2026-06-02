import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  status: string;
  category: string;
  image: string;
  colors: string[];
  [key: string]: any; 
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8000/api/productos';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(items => items.map(item => this.mapToProduct(item)))
    );
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(item => this.mapToProduct(item))
    );
  }

  private mapToProduct(item: any): Product {
    return {
      ...item,
      name: item.titulo || item.name,
      price: Number(item.precio || item.price),
      image: item.foto_url || item.image,
      stock: Number(item.stock || 0),
      status: 'Activo', // Hardcoded status for now since it's not in DB
      category: 'Sin Categoría', // Hardcoded category since it's not in DB
      colors: item.colores ? item.colores.split(',') : []
    };
  }
}


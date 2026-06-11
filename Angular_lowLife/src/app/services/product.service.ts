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
  colors: any[];
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

  createProduct(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  updateProduct(id: number, formData: FormData): Observable<any> {
    formData.append('_method', 'PUT'); // Fake PUT request for Laravel multipart
    return this.http.post<any>(`${this.apiUrl}/${id}`, formData);
  }

  private mapToProduct(item: any): Product {
    let parsedColors = [];
    if (item.colores) {
      try {
        parsedColors = item.colores.startsWith('[') ? JSON.parse(item.colores) : item.colores.split(',');
      } catch(e) {
        parsedColors = item.colores.split(',');
      }
    }

    return {
      ...item,
      name: item.titulo || item.name,
      price: Number(item.precio || item.price),
      image: item.foto_url || item.image,
      stock: Number(item.stock || 0),
      status: item.estado === 'active' ? 'Activo' : (item.estado === 'inactive' ? 'Inactivo' : 'Borrador'),
      category: item.categoria || 'Sin Categoría',
      colors: parsedColors
    };
  }
}


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
  variaciones?: any[];
  [key: string]: any; 
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'https://ruix.iesruizgijon.es/agarcia/laravel/public/api/productos';

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
    let parsedColors: any[] = [];
    if (item.colores) {
      try {
        parsedColors = item.colores.startsWith('[') ? JSON.parse(item.colores) : item.colores.split(',');
      } catch(e) {
        parsedColors = item.colores.split(',');
      }
    }

    let totalStock = 0;
    if (item.variaciones && Array.isArray(item.variaciones)) {
      totalStock = item.variaciones.reduce((acc: number, val: any) => acc + (Number(val.stock) || 0), 0);
      
      // Extraemos colores también desde las variaciones
      item.variaciones.forEach((v: any) => {
          if (v.color_nombre || v.color_hex) {
              const hex = v.color_hex || '';
              const name = v.color_nombre || hex;
              
              const exists = parsedColors.some(c => {
                  if (typeof c === 'string') return c.trim().toLowerCase() === name.trim().toLowerCase() || c.trim().toLowerCase() === hex.trim().toLowerCase();
                  if (typeof c === 'object') return (c.name && c.name.trim().toLowerCase() === name.trim().toLowerCase()) || (c.hex && c.hex.trim().toLowerCase() === hex.trim().toLowerCase());
                  return false;
              });
              
              if (!exists) {
                  parsedColors.push({ name: v.color_nombre || '', hex: hex });
              }
          }
      });
    } else {
      totalStock = Number(item.stock || 0);
    }

    return {
      ...item,
      name: item.titulo || item.name,
      price: Number(item.precio || item.price),
      image: item.foto_url || item.image,
      stock: totalStock,
      status: item.estado === 'active' ? 'Activo' : (item.estado === 'inactive' ? 'Inactivo' : 'Borrador'),
      category: item.categoria || 'Sin Categoría',
      colors: parsedColors
    };
  }
}


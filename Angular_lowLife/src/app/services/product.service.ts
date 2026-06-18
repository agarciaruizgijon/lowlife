import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Interfaz que define la estructura estándar de un producto en el Frontend.
// Esto nos ayuda a tener autocompletado y a evitar errores al usar los datos.
export interface Product {
  id: number;
  name: string;           // Nombre mapeado (viene de 'titulo' o 'name' del backend)
  price: number;          // Precio mapeado
  stock: number;          // Stock total calculado
  status: string;         // Estado mapeado (ej. 'Activo', 'Inactivo', 'Borrador')
  category: string;       // Categoría
  image: string;          // URL de la imagen (viene de 'foto_url' o 'image')
  colors: any[];          // Lista de colores analizada
  variaciones?: any[];    // Lista de variaciones (talla/color/stock) opcional
  [key: string]: any;     // Permite que el objeto tenga otras propiedades dinámicas (provenientes del backend)
}

@Injectable({
  providedIn: 'root' // Indica que este servicio está disponible de forma global en toda la app
})
export class ProductService {
  // URL base de la API de Laravel alojada en el servidor externo
  private apiUrl = 'https://ruix.iesruizgijon.es/agarcia/laravel/public/api/productos';

  // Inyectamos HttpClient para poder hacer peticiones (GET, POST, PUT, DELETE) a la API
  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista completa de productos desde el backend.
   * @returns Un Observable que emitirá un array de productos ya mapeados/adaptados.
   */
  getProducts(): Observable<Product[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      // Usamos 'map' de RxJS para transformar la respuesta del backend
      // Pasamos cada elemento devuelto por Laravel por nuestra función 'mapToProduct'
      map(items => items.map(item => this.mapToProduct(item)))
    );
  }

  /**
   * Obtiene los datos de un único producto por su ID.
   * @param id El identificador único del producto.
   */
  getProduct(id: number): Observable<Product> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      // Al igual que antes, transformamos la respuesta en un objeto Product estandarizado
      map(item => this.mapToProduct(item))
    );
  }

  /**
   * Crea un nuevo producto enviando los datos al backend mediante un POST.
   * Se usa FormData en lugar de JSON porque se puede estar enviando una imagen (archivo físico).
   * @param formData Datos empaquetados listos para subir.
   */
  createProduct(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  /**
   * Actualiza un producto existente en el backend.
   * @param id El identificador del producto a actualizar.
   * @param formData Datos modificados listos para subir.
   */
  updateProduct(id: number, formData: FormData): Observable<any> {
    // IMPORTANTE: Laravel y PHP tienen problemas nativos para recibir datos FormData (archivos) 
    // a través de peticiones HTTP PUT. Por lo tanto, enviamos la petición como POST, 
    // pero le añadimos el campo extra '_method' con el valor 'PUT' (conocido como "Method Spoofing").
    // Laravel leerá esto y la tratará internamente como si fuera una petición PUT real.
    formData.append('_method', 'PUT'); 
    return this.http.post<any>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Elimina un producto en el backend.
   * @param id El identificador del producto a eliminar.
   */
  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Función adaptadora fundamental: Convierte el objeto "crudo" que devuelve Laravel 
   * (con nombres de columnas de la base de datos) al formato estandarizado que 
   * espera y utiliza Angular (la interfaz Product).
   * @param item El objeto devuelto por Laravel.
   */
  private mapToProduct(item: any): Product {
    // 1. Análisis de Colores (Parsea la cadena que viene del backend a un Array real)
    let parsedColors: any[] = [];
    if (item.colores) {
      try {
        // Intenta interpretar los colores como JSON (ej: si vienen guardados como '[{"name": "Rojo", "hex": "#FF0000"}]')
        // Si no es un JSON que empieza por '[', asume que es una simple lista separada por comas (ej: 'rojo,azul')
        parsedColors = item.colores.startsWith('[') ? JSON.parse(item.colores) : item.colores.split(',');
      } catch(e) {
        // Si falla el parseo JSON, lo divide por comas de forma segura por defecto
        parsedColors = item.colores.split(',');
      }
    }

    // 2. Cálculo del Stock Total y Extracción de Colores adicionales
    let totalStock = 0;
    if (item.variaciones && Array.isArray(item.variaciones)) {
      // Si el producto tiene variaciones, el stock total es la suma de los stocks de todas sus variaciones
      totalStock = item.variaciones.reduce((acc: number, val: any) => acc + (Number(val.stock) || 0), 0);
      
      // Además, si las variaciones traen nuevos colores configurados, los extraemos y los añadimos a nuestra lista
      item.variaciones.forEach((v: any) => {
          if (v.color_nombre || v.color_hex) {
              const hex = v.color_hex || '';
              const name = v.color_nombre || hex;
              
              // Verificamos si este color ya existe en la lista para evitar duplicados
              const exists = parsedColors.some(c => {
                  if (typeof c === 'string') return c.trim().toLowerCase() === name.trim().toLowerCase() || c.trim().toLowerCase() === hex.trim().toLowerCase();
                  if (typeof c === 'object') return (c.name && c.name.trim().toLowerCase() === name.trim().toLowerCase()) || (c.hex && c.hex.trim().toLowerCase() === hex.trim().toLowerCase());
                  return false;
              });
              
              // Si no existía, lo guardamos como un objeto estandarizado con nombre y hexadecimal
              if (!exists) {
                  parsedColors.push({ name: v.color_nombre || '', hex: hex });
              }
          }
      });
    } else {
      // Si el producto no tiene variaciones, el stock total es simplemente el stock definido en la tabla principal
      totalStock = Number(item.stock || 0);
    }

    // 3. Construimos y devolvemos el objeto final estandarizado.
    // Usamos el operador spread (...) para copiar todas las propiedades originales,
    // y sobrescribimos/creamos las propiedades clave para nuestra interfaz Frontend.
    return {
      ...item,
      name: item.titulo || item.name,           // Mapeo unificado del nombre
      price: Number(item.precio || item.price), // Forzamos que el precio sea numérico para evitar errores
      image: item.foto_url || item.image,       // Mapeo unificado de la URL de la imagen principal
      stock: totalStock,                        // Stock recalculado automáticamente
      status: item.estado === 'active' ? 'Activo' : (item.estado === 'inactive' ? 'Inactivo' : 'Borrador'), // Traducción visual del estado
      category: item.categoria || 'Sin Categoría', // Categoría por defecto si está vacía
      colors: parsedColors                      // El array final de colores limpio y organizado
    };
  }
}


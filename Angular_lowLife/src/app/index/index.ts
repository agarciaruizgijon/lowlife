import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProductService, Product } from '../services/product.service';

@Component({
  selector: 'app-index',
  standalone: false,
  templateUrl: './index.html',
  styleUrl: './index.css',
})
export class Index implements OnInit {
  // Configuración de ordenación por defecto
  activeSort: string = 'destacado';
  // Precio máximo por defecto para el filtro de precio
  maxPrice: number = 300;
  // Estado para controlar si el modal de filtros en móvil está abierto
  isFilterModalOpen: boolean = false;
  // Mensaje para notificaciones (toasts)
  toastMessage: string | null = null;
  
  // Lista original con todos los productos obtenidos del servidor
  allArticulos: Product[] = [];
  // Lista de productos filtrados que se muestran actualmente en la vista
  articulos: Product[] = [];

  // Filtros dinámicos: opciones disponibles basadas en los productos existentes
  availableCategories: string[] = []; // Categorías únicas extraídas de los productos
  availableSizes: string[] = []; // Tallas únicas extraídas de los productos
  
  // Colores base predefinidos con sus nombres y códigos hexadecimales
  baseColors = [
    { name: 'Negro', hex: '#000000' },
    { name: 'Blanco', hex: '#ffffff' },
    { name: 'Gris', hex: '#808080' },
    { name: 'Marrón', hex: '#8B4513' },
    { name: 'Rojo', hex: '#FF0000' },
    { name: 'Naranja', hex: '#FFA500' },
    { name: 'Amarillo', hex: '#FFFF00' },
    { name: 'Verde', hex: '#008000' },
    { name: 'Azul', hex: '#0000FF' },
    { name: 'Morado', hex: '#800080' },
    { name: 'Rosa', hex: '#FFC0CB' }
  ];

  // Estado de los filtros: qué opciones ha seleccionado el usuario
  selectedCategories: string[] = [];
  selectedSizes: string[] = [];
  selectedColors: string[] = [];

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef // Se usa para forzar la actualización de la vista cuando los datos cambian
  ) {}

  ngOnInit(): void {
    // Comprueba si hay un mensaje (toast) proveniente de la navegación anterior (ej: redirección tras login)
    if (history.state && history.state.toastMessage) {
      this.toastMessage = history.state.toastMessage;
      // El mensaje desaparecerá al cambiar de página porque al navegar `history.state` cambia.
    }

    // Llama al servicio para obtener todos los productos del backend
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.allArticulos = data; // Guarda la lista original de productos
        
        // Extrae solo las categorías únicas de todos los artículos para llenar el filtro de categorías
        const uniqueCategories = new Set<string>();
        this.allArticulos.forEach(p => {
          if (p.category) {
            // Capitaliza la primera letra (ej: 'camisetas' -> 'Camisetas')
            const cat = p.category.charAt(0).toUpperCase() + p.category.slice(1).toLowerCase();
            uniqueCategories.add(cat);
          }
        });
        // Convierte el Set a Array y lo ordena alfabéticamente
        this.availableCategories = Array.from(uniqueCategories).sort();

        // Actualiza las tallas y colores disponibles en base a los productos (inicialmente sin filtros de categoría)
        this.updateDynamicFilters();
        
        // Aplica los filtros iniciales (al principio, muestra todos los productos)
        this.applyFilters();
        // Fuerza la detección de cambios para que Angular actualice el HTML de inmediato
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error fetching products', err) // Muestra error si falla la petición
    });
  }

  /**
   * Actualiza las tallas y colores disponibles en el menú de filtros
   * basándose únicamente en los productos de las categorías actualmente seleccionadas.
   */
  updateDynamicFilters() {
    const uniqueSizes = new Set<string>();
    const uniqueColorsMap = new Map<string, {name: string, hex: string}>();

    // Filtra los artículos para considerar solo los de las categorías seleccionadas.
    // Si no hay categorías seleccionadas, se toman en cuenta todos los artículos.
    const articlesToConsider = this.selectedCategories.length > 0 
      ? this.allArticulos.filter(p => {
          const catLower = (p.category || '').toLowerCase();
          return this.selectedCategories.map(c => c.toLowerCase()).includes(catLower);
        })
      : this.allArticulos;

    // Recorre los artículos válidos para extraer sus tallas y colores
    articlesToConsider.forEach(p => {
      // --- Extracción de tallas ---
      if (p['tallas']) {
        // Algunas veces 'tallas' es un string separado por comas, otras un array
        const tArray = typeof p['tallas'] === 'string' ? p['tallas'].split(',') : p['tallas'];
        tArray.forEach((t: string) => {
            if (t.trim()) uniqueSizes.add(t.trim().toUpperCase());
        });
      }
      // También se revisan las variaciones del producto para encontrar tallas
      if (p.variaciones) {
         p.variaciones.forEach((v: any) => {
           if (v.talla && v.talla.trim()) uniqueSizes.add(v.talla.trim().toUpperCase());
         });
      }

      // --- Extracción de colores ---
      if (p.colors && p.colors.length > 0) {
        p.colors.forEach((c: any) => {
          let cName = '';
          let cHex = '';
          
          // Si el color viene como texto plano (ej: "#FF0000" o "Rojo")
          if (typeof c === 'string') {
            if (c.startsWith('#')) {
              cHex = c;
              cName = this.hexToBaseColor(c); // Transforma hex a un nombre de color base
            } else {
              cName = c;
              cHex = this.getBaseColorHex(cName); // Transforma el nombre a hex
            }
          // Si el color viene como un objeto (ej: { name: "Rojo", hex: "#FF0000" })
          } else if (typeof c === 'object') {
            cName = c.name || this.hexToBaseColor(c.hex || '#000000');
            cHex = c.hex || this.getBaseColorHex(cName);
          }
          
          if (cName) {
             // Mapea a un color base estandarizado para agrupar tonos similares (ej: "Celeste" -> "Azul")
             const baseName = this.mapColorToBase(cName);
             if (!uniqueColorsMap.has(baseName)) {
                // Guarda el color único con su nombre base y su color hexadecimal representativo
                uniqueColorsMap.set(baseName, { name: baseName, hex: this.getBaseColorHex(baseName) || cHex || '#808080' });
             }
          }
        });
      }
    });

    // Ordena las tallas con un orden lógico definido (XS a XXL), el resto alfabéticamente
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'UNITALLA'];
    this.availableSizes = Array.from(uniqueSizes).sort((a, b) => {
        const idxA = sizeOrder.indexOf(a);
        const idxB = sizeOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB; // Si ambas están en la lista ordenada
        if (idxA !== -1) return -1; // Si solo A está en la lista
        if (idxB !== -1) return 1;  // Si solo B está en la lista
        return a.localeCompare(b);  // Si ninguna está en la lista, orden alfabético
    });

    // Actualiza la lista de colores base con los encontrados y los ordena alfabéticamente
    if (uniqueColorsMap.size > 0) {
        this.baseColors = Array.from(uniqueColorsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    } else {
        this.baseColors = []; // Limpia si no hay colores disponibles
    }
  }

  /**
   * Obtiene el código hexadecimal correspondiente a un nombre de color básico.
   */
  getBaseColorHex(colorName: string): string {
    const textColors: { [key: string]: string } = {
      'blanco': '#ffffff', 'negro': '#000000', 'gris': '#808080', 'rojo': '#FF0000',
      'azul': '#0000FF', 'verde': '#008000', 'amarillo': '#FFFF00', 'naranja': '#FFA500',
      'morado': '#800080', 'rosa': '#FFC0CB', 'marron': '#8B4513', 'marrón': '#8B4513',
      'beige': '#F5F5DC', 'burdeos': '#800020', 'celeste': '#87CEEB', 'marino': '#000080'
    };
    return textColors[colorName.toLowerCase().trim()] || '';
  }

  // Abre el menú modal de filtros (generalmente usado en vistas móviles)
  openFilterModal() {
    this.isFilterModalOpen = true;
    document.body.style.overflow = 'hidden'; // Evita que la página por debajo haga scroll
  }

  // Cierra el menú modal de filtros
  closeFilterModal() {
    this.isFilterModalOpen = false;
    document.body.style.overflow = ''; // Restaura el scroll de la página
  }

  /**
   * Se ejecuta cuando el usuario cambia el valor del slider de precio.
   */
  updatePrice(event: Event) {
    const input = event.target as HTMLInputElement;
    this.maxPrice = Number(input.value); // Actualiza el precio máximo permitido
    this.applyFilters(); // Vuelve a aplicar todos los filtros y actualiza la lista mostrada
  }

  /**
   * Agrega o quita una categoría de la lista de filtros seleccionados por el usuario.
   */
  toggleCategory(cat: string) {
    const idx = this.selectedCategories.indexOf(cat);
    if (idx > -1) this.selectedCategories.splice(idx, 1); // Si ya estaba seleccionada, la quita
    else this.selectedCategories.push(cat); // Si no lo estaba, la añade
    
    // Al cambiar las categorías seleccionadas, se recalculan las tallas y colores que deben mostrarse en el menú
    this.updateDynamicFilters();
    
    this.applyFilters(); // Aplica los cambios visuales filtrando los productos
  }
  
  /**
   * Agrega o quita una talla de los filtros seleccionados.
   */
  toggleSize(size: string) {
    const idx = this.selectedSizes.indexOf(size);
    if (idx > -1) this.selectedSizes.splice(idx, 1);
    else this.selectedSizes.push(size);
    this.applyFilters();
  }
  
  /**
   * Agrega o quita un color de los filtros seleccionados.
   */
  toggleColor(colorName: string) {
    const idx = this.selectedColors.indexOf(colorName);
    if (idx > -1) this.selectedColors.splice(idx, 1);
    else this.selectedColors.push(colorName);
    this.applyFilters();
  }

  /**
   * Función principal que toma la lista total de productos (`allArticulos`)
   * y guarda en `articulos` únicamente los que cumplen las reglas de los filtros seleccionados.
   */
  applyFilters() {
    this.articulos = this.allArticulos.filter(p => {
      // 1. Filtro por precio: descarta el producto si es más caro que el slider
      if (p.price > this.maxPrice) return false;
      
      // 2. Filtro por categoría: el producto debe pertenecer a al menos una categoría seleccionada
      if (this.selectedCategories.length > 0) {
        const catLower = (p.category || '').toLowerCase();
        if (!this.selectedCategories.map(c => c.toLowerCase()).includes(catLower)) return false;
      }
      
      // 3. Filtro por talla: el producto debe tener al menos una de las tallas marcadas
      if (this.selectedSizes.length > 0) {
        let hasSize = false;
        // Busca en la propiedad "tallas" directa del producto
        if (p['tallas']) {
            const tArray = typeof p['tallas'] === 'string' ? p['tallas'].split(',') : p['tallas'];
            hasSize = tArray.some((t: string) => this.selectedSizes.map(s => s.toLowerCase()).includes(t.trim().toLowerCase()));
        }
        // Si no la encuentra, busca también dentro de las "variaciones" del producto
        if (!hasSize && p.variaciones) {
            hasSize = p.variaciones.some((v: any) => v.talla && this.selectedSizes.map(s => s.toLowerCase()).includes(v.talla.trim().toLowerCase()));
        }
        if (!hasSize) return false; // Si no tiene la talla buscada, lo descartamos
      }
      
      // 4. Filtro por color: el producto debe tener al menos uno de los colores marcados
      if (this.selectedColors.length > 0) {
        let hasColor = false;
        if (p.colors && p.colors.length > 0) {
            hasColor = p.colors.some(c => {
                let cName = typeof c === 'string' ? c : (c.name || c.hex || '');
                return this.selectedColors.includes(this.mapColorToBase(cName)); // Compara usando el color normalizado (base)
            });
        }
        if (!hasColor) return false; // Si no tiene el color buscado, lo descartamos
      }
      
      // Si el producto ha superado todas las condiciones de arriba, se muestra
      return true;
    });
    
    // Una vez filtrada la lista, se ordena según lo que haya seleccionado el usuario
    this.sortArticles(this.activeSort);
  }

  /**
   * Ordena los artículos actualmente mostrados según la opción de ordenar elegida.
   */
  sortArticles(sortType: string) {
    this.activeSort = sortType; // Guarda el tipo de ordenación activo para la vista
    if (sortType === 'mayor_precio') {
      this.articulos.sort((a, b) => b.price - a.price); // Ordena de mayor a menor precio
    } else if (sortType === 'menor_precio') {
      this.articulos.sort((a, b) => a.price - b.price); // Ordena de menor a mayor precio
    } else {
      this.articulos.sort((a, b) => a.id - b.id); // Orden "destacado" o por defecto (según ID o creación)
    }
  }

  /**
   * Convierte nombres de colores muy específicos o variaciones (ej: "Celeste" o "Burdeos")
   * a su familia de color principal o "base" (ej: "Azul" o "Rojo") para facilitar los filtros a los usuarios.
   */
  mapColorToBase(colorString: string): string {
    colorString = colorString.toLowerCase().trim();
    const textColors: { [key: string]: string } = {
      'blanco': 'Blanco', 'negro': 'Negro', 'gris': 'Gris', 'rojo': 'Rojo',
      'azul': 'Azul', 'verde': 'Verde', 'amarillo': 'Amarillo', 'naranja': 'Naranja',
      'morado': 'Morado', 'rosa': 'Rosa', 'marron': 'Marrón', 'marrón': 'Marrón',
      'beige': 'Marrón', 'burdeos': 'Rojo', 'celeste': 'Azul', 'marino': 'Azul'
    };
    
    // Si encuentra coincidencia directa, devuelve el color base
    if (textColors[colorString]) return textColors[colorString];
    
    // Si lo que recibimos es un código hexadecimal en vez de un nombre, usamos una lógica matemática
    if (colorString.startsWith('#')) {
      return this.hexToBaseColor(colorString);
    }
    
    // Búsqueda por palabra clave (ej: si dice "azul oscuro" lo asocia rápidamente a "Azul")
    for (const key in textColors) {
        if (colorString.includes(key)) return textColors[key];
    }
    
    return 'Gris'; // Valor por defecto si no lo sabe clasificar
  }

  /**
   * Analiza matemáticamente un código de color hexadecimal (ej: #FF0000)
   * y determina a qué familia de color básico (ej: "Rojo") corresponde.
   */
  hexToBaseColor(hex: string): string {
    let r = 0, g = 0, b = 0;
    // Convierte el valor hexadecimal a formato RGB
    if (hex.length === 4) { // Formato corto (ej: #FFF)
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length >= 7) { // Formato completo (ej: #FFFFFF)
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    
    // Convierte el formato RGB al modelo de color HSL (Tono, Saturación y Luminosidad).
    // Este modelo es mucho mejor para que el ordenador determine visualmente "de qué color es" algo.
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    h = Math.round(h * 360); // Tono en grados (0-360 en la rueda de color)
    s = Math.round(s * 100); // Saturación en porcentaje
    l = Math.round(l * 100); // Luminosidad en porcentaje

    // Lógica para detectar el color base usando la luminosidad y la saturación:
    if (l < 15) return 'Negro'; // Si es muy oscuro es negro
    if (l > 90) return 'Blanco'; // Si es muy claro es blanco
    if (s < 15) return 'Gris'; // Si no tiene mucha intensidad/saturación es gris

    // Lógica para detectar el color basándose en el Tono (grados en el círculo cromático):
    if (h < 15 || h >= 345) return 'Rojo';
    if (h >= 15 && h < 45) {
        if (s < 50 || l < 50) return 'Marrón'; // Si es un naranja/rojo oscuro o poco saturado
        return 'Naranja';
    }
    if (h >= 45 && h < 65) return 'Amarillo';
    if (h >= 65 && h < 160) return 'Verde';
    if (h >= 160 && h < 260) return 'Azul';
    if (h >= 260 && h < 315) return 'Morado';
    if (h >= 315 && h < 345) return 'Rosa';
    
    return 'Gris'; // Valor a prueba de fallos
  }
}


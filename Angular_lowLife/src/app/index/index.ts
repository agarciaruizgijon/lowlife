import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProductService, Product } from '../services/product.service';

@Component({
  selector: 'app-index',
  standalone: false,
  templateUrl: './index.html',
  styleUrl: './index.css',
})
export class Index implements OnInit {
  activeSort: string = 'destacado';
  maxPrice: number = 300;
  isFilterModalOpen: boolean = false;
  toastMessage: string | null = null;
  
  allArticulos: Product[] = [];
  articulos: Product[] = [];

  // Dynamic filter lists
  availableCategories: string[] = [];
  availableSizes: string[] = [];
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

  // Selected filters
  selectedCategories: string[] = [];
  selectedSizes: string[] = [];
  selectedColors: string[] = [];

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (history.state && history.state.toastMessage) {
      this.toastMessage = history.state.toastMessage;
      // El mensaje desaparecerá al cambiar de página porque al navegar `history.state` cambia.
    }

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.allArticulos = data;
        
        // Extraemos solo las categorías disponibles de todos los artículos de forma inicial
        const uniqueCategories = new Set<string>();
        this.allArticulos.forEach(p => {
          if (p.category) {
            const cat = p.category.charAt(0).toUpperCase() + p.category.slice(1).toLowerCase();
            uniqueCategories.add(cat);
          }
        });
        this.availableCategories = Array.from(uniqueCategories).sort();

        // Actualizamos las tallas y colores en base a lo que haya (inicialmente sin filtros de categoría)
        this.updateDynamicFilters();
        
        this.applyFilters();
        this.cdr.detectChanges(); // Forzar actualización de la vista
      },
      error: (err) => console.error('Error fetching products', err)
    });
  }

  // Comentario: Esta función actualiza las tallas y colores disponibles según las categorías seleccionadas
  updateDynamicFilters() {
    const uniqueSizes = new Set<string>();
    const uniqueColorsMap = new Map<string, {name: string, hex: string}>();

    // Filtramos los artículos para considerar solo los de las categorías seleccionadas
    // Si no hay categorías seleccionadas, usamos todos los artículos
    const articlesToConsider = this.selectedCategories.length > 0 
      ? this.allArticulos.filter(p => {
          const catLower = (p.category || '').toLowerCase();
          return this.selectedCategories.map(c => c.toLowerCase()).includes(catLower);
        })
      : this.allArticulos;

    articlesToConsider.forEach(p => {
      // Extraer tallas disponibles para los artículos filtrados
      if (p['tallas']) {
        const tArray = typeof p['tallas'] === 'string' ? p['tallas'].split(',') : p['tallas'];
        tArray.forEach((t: string) => {
            if (t.trim()) uniqueSizes.add(t.trim().toUpperCase());
        });
      }
      if (p.variaciones) {
         p.variaciones.forEach((v: any) => {
           if (v.talla && v.talla.trim()) uniqueSizes.add(v.talla.trim().toUpperCase());
         });
      }

      // Extraer colores disponibles para los artículos filtrados
      if (p.colors && p.colors.length > 0) {
        p.colors.forEach((c: any) => {
          let cName = '';
          let cHex = '';
          // Procesamos si el color es un string (ej. "#FF0000" o "Rojo")
          if (typeof c === 'string') {
            if (c.startsWith('#')) {
              cHex = c;
              cName = this.hexToBaseColor(c);
            } else {
              cName = c;
              cHex = this.getBaseColorHex(cName);
            }
          // Procesamos si el color es un objeto (ej. { name: "Rojo", hex: "#FF0000" })
          } else if (typeof c === 'object') {
            // Arreglamos la extracción del nombre del color
            cName = c.name || this.hexToBaseColor(c.hex || '#000000');
            cHex = c.hex || this.getBaseColorHex(cName);
          }
          
          if (cName) {
             // Mapeamos a un color base estandarizado ("Rojo", "Azul", etc.)
             const baseName = this.mapColorToBase(cName);
             if (!uniqueColorsMap.has(baseName)) {
                uniqueColorsMap.set(baseName, { name: baseName, hex: this.getBaseColorHex(baseName) || cHex || '#808080' });
             }
          }
        });
      }
    });

    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'UNITALLA'];
    this.availableSizes = Array.from(uniqueSizes).sort((a, b) => {
        const idxA = sizeOrder.indexOf(a);
        const idxB = sizeOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });

    if (uniqueColorsMap.size > 0) {
        this.baseColors = Array.from(uniqueColorsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    } else {
        this.baseColors = []; // Limpiamos si no hay colores
    }
  }

  getBaseColorHex(colorName: string): string {
    const textColors: { [key: string]: string } = {
      'blanco': '#ffffff', 'negro': '#000000', 'gris': '#808080', 'rojo': '#FF0000',
      'azul': '#0000FF', 'verde': '#008000', 'amarillo': '#FFFF00', 'naranja': '#FFA500',
      'morado': '#800080', 'rosa': '#FFC0CB', 'marron': '#8B4513', 'marrón': '#8B4513',
      'beige': '#F5F5DC', 'burdeos': '#800020', 'celeste': '#87CEEB', 'marino': '#000080'
    };
    return textColors[colorName.toLowerCase().trim()] || '';
  }

  openFilterModal() {
    this.isFilterModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeFilterModal() {
    this.isFilterModalOpen = false;
    document.body.style.overflow = '';
  }

  updatePrice(event: Event) {
    const input = event.target as HTMLInputElement;
    this.maxPrice = Number(input.value);
    this.applyFilters();
  }

  // Comentario: Al activar o desactivar una categoría, actualizamos los filtros dinámicos (tallas y colores)
  toggleCategory(cat: string) {
    const idx = this.selectedCategories.indexOf(cat);
    if (idx > -1) this.selectedCategories.splice(idx, 1);
    else this.selectedCategories.push(cat);
    
    // Comentario: Recalculamos tallas y colores en base a la nueva selección de categorías
    this.updateDynamicFilters();
    
    this.applyFilters();
  }
  
  toggleSize(size: string) {
    const idx = this.selectedSizes.indexOf(size);
    if (idx > -1) this.selectedSizes.splice(idx, 1);
    else this.selectedSizes.push(size);
    this.applyFilters();
  }
  
  toggleColor(colorName: string) {
    const idx = this.selectedColors.indexOf(colorName);
    if (idx > -1) this.selectedColors.splice(idx, 1);
    else this.selectedColors.push(colorName);
    this.applyFilters();
  }

  applyFilters() {
    this.articulos = this.allArticulos.filter(p => {
      if (p.price > this.maxPrice) return false;
      
      if (this.selectedCategories.length > 0) {
        const catLower = (p.category || '').toLowerCase();
        if (!this.selectedCategories.map(c => c.toLowerCase()).includes(catLower)) return false;
      }
      
      if (this.selectedSizes.length > 0) {
        let hasSize = false;
        if (p['tallas']) {
            const tArray = typeof p['tallas'] === 'string' ? p['tallas'].split(',') : p['tallas'];
            hasSize = tArray.some((t: string) => this.selectedSizes.map(s => s.toLowerCase()).includes(t.trim().toLowerCase()));
        }
        if (!hasSize && p.variaciones) {
            hasSize = p.variaciones.some((v: any) => v.talla && this.selectedSizes.map(s => s.toLowerCase()).includes(v.talla.trim().toLowerCase()));
        }
        if (!hasSize) return false;
      }
      
      if (this.selectedColors.length > 0) {
        let hasColor = false;
        if (p.colors && p.colors.length > 0) {
            hasColor = p.colors.some(c => {
                let cName = typeof c === 'string' ? c : (c.name || c.hex || '');
                return this.selectedColors.includes(this.mapColorToBase(cName));
            });
        }
        if (!hasColor) return false;
      }
      
      return true;
    });
    
    this.sortArticles(this.activeSort);
  }

  sortArticles(sortType: string) {
    this.activeSort = sortType;
    if (sortType === 'mayor_precio') {
      this.articulos.sort((a, b) => b.price - a.price);
    } else if (sortType === 'menor_precio') {
      this.articulos.sort((a, b) => a.price - b.price);
    } else {
      this.articulos.sort((a, b) => a.id - b.id);
    }
  }

  // Lógica de mapeo de color
  mapColorToBase(colorString: string): string {
    colorString = colorString.toLowerCase().trim();
    const textColors: { [key: string]: string } = {
      'blanco': 'Blanco', 'negro': 'Negro', 'gris': 'Gris', 'rojo': 'Rojo',
      'azul': 'Azul', 'verde': 'Verde', 'amarillo': 'Amarillo', 'naranja': 'Naranja',
      'morado': 'Morado', 'rosa': 'Rosa', 'marron': 'Marrón', 'marrón': 'Marrón',
      'beige': 'Marrón', 'burdeos': 'Rojo', 'celeste': 'Azul', 'marino': 'Azul'
    };
    
    if (textColors[colorString]) return textColors[colorString];
    
    if (colorString.startsWith('#')) {
      return this.hexToBaseColor(colorString);
    }
    
    for (const key in textColors) {
        if (colorString.includes(key)) return textColors[key];
    }
    
    return 'Gris'; // Fallback
  }

  hexToBaseColor(hex: string): string {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length >= 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    
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
    
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    if (l < 15) return 'Negro';
    if (l > 90) return 'Blanco';
    if (s < 15) return 'Gris';

    if (h < 15 || h >= 345) return 'Rojo';
    if (h >= 15 && h < 45) {
        if (s < 50 || l < 50) return 'Marrón';
        return 'Naranja';
    }
    if (h >= 45 && h < 65) return 'Amarillo';
    if (h >= 65 && h < 160) return 'Verde';
    if (h >= 160 && h < 260) return 'Azul';
    if (h >= 260 && h < 315) return 'Morado';
    if (h >= 315 && h < 345) return 'Rosa';
    
    return 'Gris';
  }
}


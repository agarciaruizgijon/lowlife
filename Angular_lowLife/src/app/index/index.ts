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
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.allArticulos = data;
        
        // Listas fijas según diseño original
        this.availableCategories = ['Camisetas', 'Sudaderas', 'Pantalones', 'Accesorios'];
        this.availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unitalla'];
        
        this.applyFilters();
        this.cdr.detectChanges(); // Forzar actualización de la vista
      },
      error: (err) => console.error('Error fetching products', err)
    });
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

  toggleCategory(cat: string) {
    const idx = this.selectedCategories.indexOf(cat);
    if (idx > -1) this.selectedCategories.splice(idx, 1);
    else this.selectedCategories.push(cat);
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
        if (!hasSize) return false;
      }
      
      if (this.selectedColors.length > 0) {
        let hasColor = false;
        if (p.colors && p.colors.length > 0) {
            hasColor = p.colors.some(c => this.selectedColors.includes(this.mapColorToBase(c)));
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


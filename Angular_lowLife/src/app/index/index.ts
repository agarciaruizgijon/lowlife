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

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.allArticulos = data;
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

  applyFilters() {
    this.articulos = this.allArticulos.filter(a => a.price <= this.maxPrice);
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
}


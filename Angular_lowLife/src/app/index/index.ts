import { Component } from '@angular/core';

@Component({
  selector: 'app-index',
  standalone: false,
  templateUrl: './index.html',
  styleUrl: './index.css',
})
export class Index {
  activeSort: string = 'destacado';
  maxPrice: number = 300;
  isFilterModalOpen: boolean = false;

  openFilterModal() {
    this.isFilterModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeFilterModal() {
    this.isFilterModalOpen = false;
    document.body.style.overflow = '';
  }

  allArticulos = [
    { id: 1, name: 'Sudadera Adidas', price: 45, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80', colors: ['#ffffff', '#e53935', '#ff9800', '#3f51b5'] },
    { id: 2, name: 'Zapatos Nike', price: 60, image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=500&q=80', colors: ['#f48fb1'] },
    { id: 3, name: 'Equipación Brasil', price: 16, image: 'https://images.unsplash.com/photo-1583316174775-bd6dc0e9f298?auto=format&fit=crop&w=500&q=80', colors: ['#5c0f20'] },
    { id: 4, name: 'Reloj', price: 110, image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=500&q=80', colors: ['#e53935'] },
    { id: 5, name: 'Camiseta Basica', price: 15, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80', colors: ['#000000', '#ffffff'] },
    { id: 6, name: 'Pantalón Vaquero', price: 35, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80', colors: ['#1e88e5'] },
    { id: 7, name: 'Chaqueta Cuero', price: 120, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80', colors: ['#000000'] },
    { id: 8, name: 'Gafas de sol', price: 25, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=500&q=80', colors: ['#000000'] }
  ];

  articulos = [...this.allArticulos];

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

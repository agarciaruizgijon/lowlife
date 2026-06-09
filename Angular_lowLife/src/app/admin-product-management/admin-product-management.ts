import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProductService, Product } from '../services/product.service';

@Component({
  selector: 'app-admin-product-management',
  standalone: false,
  templateUrl: './admin-product-management.html',
  styleUrl: './admin-product-management.css',
})
export class AdminProductManagement implements OnInit {
  products: Product[] = [];

  constructor(private productService: ProductService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching products', err)
    });
  }
}

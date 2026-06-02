import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService, Product } from '../services/product.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss']
})
export class ProductDetail implements OnInit {
  producto: Product | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProduct(+id).subscribe({
        next: (data) => {
          this.producto = data;
          this.cdr.detectChanges(); // Forzar actualización de la vista
        },
        error: (err) => console.error('Error fetching product', err)
      });
    }
  }

  addToCart(): void {
    if (this.producto) {
      this.cartService.addToCart(this.producto.id, 1).subscribe({
        next: (res) => alert('¡Producto añadido a la cesta!'),
        error: (err) => alert('Error al añadir a la cesta')
      });
    }
  }
}


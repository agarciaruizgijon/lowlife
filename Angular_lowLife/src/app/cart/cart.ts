import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CartService, CartItem } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
  standalone: false
})
export class Cart implements OnInit {
  cesta: CartItem[] = [];
  total: number = 0;

  constructor(
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cartService.getCart().subscribe({
      next: (data) => {
        this.cesta = data;
        this.calculateTotal();
        this.cdr.detectChanges(); // Forzar actualización de la vista
      },
      error: (err) => console.error('Error fetching cart', err)
    });
  }

  calculateTotal(): void {
    this.total = this.cesta.reduce((acc, item) => {
      // The price is stored in item.producto.precio (from DB)
      const price = Number(item.producto?.precio || 0);
      return acc + (price * item.cantidad);
    }, 0);
  }
}


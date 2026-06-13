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
    this.loadCart();
  }

  loadCart(): void {
    this.cartService.getCart().subscribe({
      next: (data) => {
        this.cesta = data;
        this.calculateTotal();
        this.cdr.detectChanges(); // Forzar actualización de la vista
      },
      error: (err) => console.error('Error fetching cart', err)
    });
  }

  // Comentario: Actualiza la cantidad llamando al servicio y maneja errores de stock
  updateQuantity(item: CartItem, change: number): void {
    const newQuantity = item.cantidad + change;
    
    // Si la nueva cantidad es 0 o menor, preguntamos para eliminar
    if (newQuantity < 1) {
      this.removeItem(item);
      return;
    }
    
    this.cartService.updateQuantity(item.id, newQuantity).subscribe({
      next: () => {
        this.loadCart(); // Recarga la cesta para mostrar el total actualizado
      },
      error: (err) => {
        console.error('Error al actualizar la cantidad:', err);
        // Comentario: Muestra el mensaje de error del backend (ej. "Stock insuficiente...")
        const errorMessage = err.error?.message || 'Hubo un error al actualizar la cantidad.';
        alert(errorMessage);
      }
    });
  }

  // Comentario: Incrementa en 1 la cantidad del producto
  increaseQuantity(item: CartItem): void {
    this.updateQuantity(item, 1);
  }

  // Comentario: Decrementa en 1 la cantidad del producto
  decreaseQuantity(item: CartItem): void {
    this.updateQuantity(item, -1);
  }

  removeItem(item: CartItem): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto de la cesta?')) {
      this.cartService.removeFromCart(item.id).subscribe({
        next: () => {
          this.loadCart();
        },
        error: (err) => {
          console.error('Error al eliminar el producto:', err);
          alert('Hubo un error al eliminar el producto.');
        }
      });
    }
  }

  clearCart(): void {
    if (confirm('¿Estás seguro de que deseas vaciar toda la cesta? Esta acción no se puede deshacer.')) {
      this.cartService.clearCart().subscribe({
        next: () => {
          this.loadCart();
        },
        error: (err) => {
          console.error('Error al vaciar la cesta:', err);
          alert('Hubo un error al vaciar la cesta.');
        }
      });
    }
  }

  calculateTotal(): void {
    this.total = this.cesta.reduce((acc, item) => {
      // The price is stored in item.producto.precio (from DB)
      const price = Number(item.producto?.precio || 0);
      return acc + (price * item.cantidad);
    }, 0);
  }
}


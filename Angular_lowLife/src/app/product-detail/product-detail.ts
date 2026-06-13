import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss']
})
export class ProductDetail implements OnInit {
  producto: Product | null = null;
  isLiked: boolean = false; // Comentario: Estado para saber si el usuario le ha dado like
  animateHeart: boolean = false; // Comentario: Para activar la animación
  selectedColor: string = '';
  selectedSize: string = 'Unitalla';
  availableSizes: string[] = [];
  availableColors: string[] = [];

  get currentStock(): number {
    if (!this.producto || !this.producto.variaciones) return 0;
    const v = this.producto.variaciones.find((v: any) => 
      v.talla === this.selectedSize && 
      v.color_nombre === this.selectedColor
    );
    // Si la variación existe, devuelve su stock. Si no, devuelve 0.
    return v ? Number(v.stock) : 0;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProduct(+id).subscribe({
        next: (data) => {
          this.producto = data;
          if (this.producto && this.producto.variaciones && this.producto.variaciones.length > 0) {
            const sizes = new Set<string>();
            const colors = new Set<string>();

            this.producto.variaciones.forEach((v: any) => {
              if (v.talla) sizes.add(v.talla);
              if (v.color_nombre) colors.add(v.color_nombre);
            });

            this.availableSizes = Array.from(sizes);
            this.availableColors = Array.from(colors);

            if (this.availableSizes.length > 0) this.selectedSize = this.availableSizes[0];
            if (this.availableColors.length > 0) this.selectedColor = this.availableColors[0];
          }
          this.checkIfLiked(); // Comprobamos si ya le había dado like
          this.cdr.detectChanges(); // Forzar actualización de la vista
        },
        error: (err) => console.error('Error fetching product', err)
      });
    }
  }

  // Comentario: Comprueba si el producto actual está en la lista de deseados
  checkIfLiked(): void {
    if (this.authService.isLoggedIn() && this.producto) {
      this.wishlistService.getWishlist().subscribe({
        next: (deseados) => {
          this.isLiked = deseados.some(d => d.producto_id === this.producto?.id);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al comprobar deseados', err)
      });
    }
  }

  // Comentario: Función que se ejecuta al darle al corazón
  toggleLike(): void {
    if (!this.authService.isLoggedIn()) {
      alert('Debes iniciar sesión para añadir a deseados');
      return;
    }
    
    if (this.producto) {
      this.wishlistService.toggleLike(this.producto.id).subscribe({
        next: (res) => {
          this.isLiked = res.is_liked; // Actualizamos el estado del corazón según responda Laravel
          
          // Comentario: Si se ha dado like (no quitado), activamos la animación
          if (this.isLiked) {
            this.animateHeart = true;
            // Quitamos la clase después de que termine la animación (400ms)
            setTimeout(() => {
              this.animateHeart = false;
              this.cdr.detectChanges();
            }, 400);
          }
          
          this.cdr.detectChanges();
        },
        error: (err) => alert('Error al procesar tu solicitud')
      });
    }
  }

  addToCart(): void {
    if (this.producto) {
      if ((this.availableSizes.length > 0 || this.availableColors.length > 0) && this.currentStock === 0) {
        alert('La combinación seleccionada está agotada.');
        return;
      }
      this.cartService.addToCart(this.producto.id, 1, this.selectedColor, this.selectedSize).subscribe({
        next: (res) => {
            this.router.navigate(['/'], { state: { toastMessage: 'Producto añadido a la cesta' } });
        },
        error: (err) => {
          // Comentario: Muestra el error específico del backend si no hay stock suficiente
          const errorMessage = err.error?.message || 'Error al añadir a la cesta';
          alert(errorMessage);
        }
      });
    }
  }
}


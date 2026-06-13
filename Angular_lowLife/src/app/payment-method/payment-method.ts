import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-payment-method',
  standalone: false,
  templateUrl: './payment-method.html',
  styleUrls: ['./payment-method.css']
})
export class PaymentMethod implements OnInit {
  // Variable para almacenar el total del carrito
  total: number = 0;
  userId: number | null = null;

  // Objeto para almacenar los datos de la tarjeta temporalmente
  cardData: any = {
    numero: '',
    fecha: '',
    cvv: '',
    titular: '',
    recordar: true
  };

  // Inyectar los servicios necesarios
  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // Método que se ejecuta al iniciar el componente
  ngOnInit(): void {
    this.obtenerTotalCarrito();
    this.cargarTarjetaGuardada();
  }

  // Cargar tarjeta guardada del usuario si existe
  cargarTarjetaGuardada(): void {
    const user = this.authService.getUser();
    if (user && user.id) {
      this.userId = user.id;
      const savedCard = localStorage.getItem(`savedCard_${this.userId}`);
      if (savedCard) {
        this.cardData = JSON.parse(savedCard);
      }
    }
  }

  // Método para obtener los productos del carrito y calcular el total
  obtenerTotalCarrito(): void {
    this.cartService.getCart().subscribe({
      next: (data: CartItem[]) => {
        // Calcular el total sumando el precio de cada producto multiplicado por su cantidad
        this.total = data.reduce((acc, item) => {
          const price = Number(item.producto?.precio || 0);
          return acc + (price * item.cantidad);
        }, 0);
        // Forzar la actualización de la vista en caso de ser necesario
        this.cdr.detectChanges();
      },
      error: (err) => {
        // Manejar errores al obtener el carrito
        console.error('Error al obtener el carrito en el método de pago', err);
      }
    });
  }

  // Método que procesa el pago y crea el pedido en la base de datos
  procesarPago(): void {
    // 1. Recuperamos los datos de envío guardados previamente
    const shippingDataStr = localStorage.getItem('shippingData');
    if (!shippingDataStr) {
      alert('Faltan datos de envío. Por favor, vuelve atrás y rellénalos.');
      this.router.navigate(['/direccion-envio']);
      return;
    }

    const shippingData = JSON.parse(shippingDataStr);

    // 2. Preparamos el payload (datos a enviar al backend)
    const orderPayload = {
      total: this.total,
      nombre_envio: shippingData.nombre,
      apellidos_envio: shippingData.apellidos,
      direccion_envio: shippingData.direccion,
      ciudad: shippingData.ciudad,
      codigo_postal: shippingData.codigoPostal,
      telefono_envio: shippingData.telefono
    };

    // 3. Llamamos al servicio para crear el pedido
    this.orderService.placeOrder(orderPayload).subscribe({
      next: (res) => {
        // Guardar tarjeta si el usuario quiso recordarla
        if (this.cardData.recordar && this.userId) {
          localStorage.setItem(`savedCard_${this.userId}`, JSON.stringify(this.cardData));
        } else if (this.userId) {
          localStorage.removeItem(`savedCard_${this.userId}`);
        }

        // Mostramos el mensaje de éxito
        alert('¡Pago completado con éxito! Tu pedido ha sido registrado.');
        
        // Limpiamos los datos temporales
        localStorage.removeItem('shippingData');
        
        // Redirigimos al usuario a la página de su perfil para ver el pedido
        this.router.navigate(['/perfil'], { queryParams: { tab: 'pedidos' } });
      },
      error: (err) => {
        console.error('Error creando el pedido:', err);
        alert('Ocurrió un error al procesar el pedido. Por favor, inténtalo de nuevo.');
      }
    });
  }
}

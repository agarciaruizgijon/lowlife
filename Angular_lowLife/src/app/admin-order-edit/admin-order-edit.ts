import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-admin-order-edit',
  standalone: false,
  templateUrl: './admin-order-edit.html',
  styleUrl: './admin-order-edit.css',
})
export class AdminOrderEdit implements OnInit {
  // ID del pedido actual que obtenemos de la URL
  orderId: number = 0;
  // Objeto que almacenará todos los datos del pedido que nos devuelva la API
  order: any = null;
  // Controla el estado de carga (muestra el spinner mientras es true)
  loading: boolean = true;
  // Controla el estado del botón de guardado (evita múltiples clics)
  saving: boolean = false;
  // Almacena el precio total calculado del pedido
  total: number = 0;

  // Inyectamos las dependencias necesarias: rutas para el ID y OrderService para la API
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  // Método que se ejecuta al iniciar el componente
  ngOnInit(): void {
    // Capturamos el parámetro 'id' de la URL (ej. /admin-editarPedido/5)
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderId = +id; // Convertimos el string a número
      this.loadOrder();   // Llamamos a la API para cargar sus datos
    } else {
      // Si no hay ID en la URL, redirigimos de vuelta a la lista
      this.router.navigate(['/admin-pedidos']);
    }
  }

  // Función para obtener el pedido desde el backend
  loadOrder(): void {
    this.loading = true; // Mostramos el spinner
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (data) => {
        // Si la petición es exitosa, guardamos los datos y calculamos el total
        this.order = data;
        this.calculateTotal();
        this.loading = false; // Ocultamos el spinner
        this.cdr.detectChanges(); // Forzar actualización de la vista
      },
      error: (err) => {
        // Si hay error (ej. el pedido no existe), mostramos alerta y redirigimos
        console.error('Error fetching order', err);
        alert('Error: No se pudo cargar el pedido. Puede que no exista.');
        this.loading = false;
        this.cdr.detectChanges(); // Forzar actualización de la vista
        this.router.navigate(['/admin-pedidos']);
      }
    });
  }

  // Calcula el precio total sumando cantidad * precio de cada producto
  calculateTotal(): void {
    if (this.order && this.order.detalles) {
      this.total = this.order.detalles.reduce((acc: number, det: any) => acc + (det.cantidad * (det.producto?.precio || 0)), 0);
    }
  }

  // Alterna el estado del pedido entre Procesado (true) y Pendiente (false)
  toggleStatus(): void {
    if (!this.order) return;
    
    // Invertimos el estado actual
    const newStatus = !this.order.procesado;
    const actionText = newStatus ? 'marcar como procesado' : 'marcar como pendiente';

    // Usamos confirm nativo en vez de SweetAlert para evitar errores de compilación
    const confirmacion = window.confirm(`¿Estás seguro de que quieres ${actionText} este pedido?`);
    
    if (confirmacion) {
      this.saving = true; // Deshabilita el botón mientras se guarda
      // Llamamos al servicio para hacer el PUT a la API de Laravel
      this.orderService.updateOrder(this.orderId, { procesado: newStatus }).subscribe({
        next: (updatedOrder) => {
          // Si todo va bien, actualizamos el estado local para reflejar el cambio en la vista
          this.order.procesado = updatedOrder.procesado;
          this.saving = false;
          alert('El estado del pedido ha sido actualizado correctamente.');
          this.cdr.detectChanges(); // Forzar actualización visual
        },
        error: (err) => {
          console.error('Error updating order', err);
          this.saving = false;
          alert('Error: Hubo un problema al actualizar el pedido.');
          this.cdr.detectChanges();
        }
      });
    }
  }
}

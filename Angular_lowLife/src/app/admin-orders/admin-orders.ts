import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-admin-orders',
  standalone: false,
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
})
export class AdminOrders implements OnInit {
  // 'orders' guardará la lista original de pedidos obtenida de la base de datos
  orders: any[] = [];
  // 'filteredOrders' es la lista que realmente se muestra en la tabla (afectada por el buscador)
  filteredOrders: any[] = [];
  // Término de búsqueda introducido por el usuario
  searchTerm: string = '';
  // Indicador de carga inicial
  loading: boolean = true;

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Al iniciar el componente, solicitamos los pedidos
    this.loadOrders();
  }

  // Función para descargar los pedidos de la base de datos a través del servicio
  loadOrders() {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        try {
          console.log('Datos recibidos de Laravel:', data);
          
          // Mapeamos los datos que nos envía Laravel para estructurarlos más cómodamente
          this.orders = data.map(order => {
            // Sumamos el precio total basándonos en la relación 'detalles' y 'producto'
            let total = 0;
            if (order.detalles && order.detalles.length > 0) {
              total = order.detalles.reduce((acc: number, det: any) => acc + (det.cantidad * (det.producto?.precio || 0)), 0);
            }
            
            return {
              id: order.id,
              // Utilizamos navegación segura (?) por si el usuario fue borrado de la BBDD
              customer: order.usuario?.name || 'Usuario Eliminado',
              email: order.usuario?.email || 'N/A',
              // Usamos fecha de creación
              date: new Date(order.fecha || order.created_at),
              // Añadimos fecha de entrega estimada (si no está, calculamos +1 mes)
              fecha_entrega: order.fecha_entrega ? new Date(order.fecha_entrega) : (() => { const d = new Date(order.fecha || order.created_at); d.setMonth(d.getMonth() + 1); return d; })(),
              // Convertimos el booleano 'procesado' en un estado legible por retrocompatibilidad o usamos el nuevo estado
              status: order.estado || (order.procesado ? 'procesado' : 'pendiente'),
              total: total
            };
          });
          // Inicializamos la lista filtrada con todos los pedidos
          this.filteredOrders = [...this.orders];
        } catch (e) {
          console.error('Error procesando los datos de pedidos:', e);
          alert('Hubo un error al procesar los datos de los pedidos.');
        } finally {
          this.loading = false;
          // Forzamos la detección de cambios para que Angular actualice la vista inmediatamente
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error fetching orders', err);
        alert('Error conectando con la base de datos de Laravel.');
        this.loading = false; // Ocultamos el spinner incluso si hay error
        this.cdr.detectChanges();
      }
    });
  }

  // Función que se ejecuta cada vez que el usuario teclea en el buscador
  filterOrders() {
    const term = this.searchTerm.toLowerCase();
    // Filtramos el array base ('orders') y lo guardamos en 'filteredOrders'
    this.filteredOrders = this.orders.filter(order => 
      order.customer.toLowerCase().includes(term) ||
      order.id.toString().includes(term) ||
      order.status.toLowerCase().includes(term)
    );
  }
}

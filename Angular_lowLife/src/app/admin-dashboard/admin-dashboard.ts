import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProductService, Product } from '../services/product.service';
import { UserService } from '../services/user.service';
import { OrderService } from '../services/order.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  // Fecha actual para mostrar en el encabezado
  currentDate: Date = new Date();
  
  // Variables para los KPIs (Key Performance Indicators)
  totalUsuarios: number = 0; // Almacena el número total de usuarios registrados
  
  // Variables para las listas que se muestran en el dashboard
  stockAlerts: Product[] = []; // Array de productos que tienen bajo stock (< 5 unidades)
  recentOrders: any[] = []; // Array con los pedidos más recientes
  
  // Estado de carga inicial (true muestra el spinner, false muestra los datos)
  loading: boolean = true;

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Carga todos los datos necesarios para el dashboard administrativo.
   * Utiliza forkJoin para ejecutar las 3 peticiones a la API en paralelo.
   * Si alguna petición falla (ej. error de servidor), se captura con catchError
   * devolviendo un array vacío para que la carga no se quede infinita.
   */
  loadDashboardData() {
    this.loading = true; // Mostramos el estado de carga
    
    // Ejecutamos múltiples observables al mismo tiempo
    forkJoin({
      products: this.productService.getProducts().pipe(catchError(() => of([]))),
      users: this.userService.getUsers().pipe(catchError(() => of([]))),
      orders: this.orderService.getAllOrders().pipe(catchError(() => of([])))
    }).subscribe({
      next: (data) => {
        try {
          // --- Procesamiento de Productos ---
          this.stockAlerts = (data.products || [])
            .filter((p: any) => p.stock < 5)
            .sort((a: any, b: any) => a.stock - b.stock)
            .slice(0, 5);

          // --- Procesamiento de Usuarios ---
          this.totalUsuarios = (data.users || []).length;

          // --- Procesamiento de Pedidos ---
          this.recentOrders = (data.orders || []).slice(0, 5); 
        } catch (e) {
          console.error("Error procesando datos del dashboard:", e);
        } finally {
          // Finalizamos la carga para ocultar el spinner
          this.loading = false;
          
          // Forzamos la actualización de la vista inmediatamente (por si Angular no detecta los cambios automáticamente)
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error("Error cargando el panel de control", err);
        // Si hay algún error catastrófico, también quitamos la carga
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router'; // Añadimos RouterModule y ActivatedRoute
import { AuthService } from '../services/auth.service';
import { WishlistService } from '../services/wishlist.service';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // Importamos RouterModule para usar routerLink
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class Perfil implements OnInit {
  user: any = null;
  isEditing: boolean = false;
  
  // Pestaña activa ('datos', 'pedidos', 'deseados')
  activeTab: string = 'datos';

  // Datos temporales del formulario
  editData: any = {};
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  // Variables para guardar las listas
  pedidos: any[] = [];
  deseados: any[] = [];

  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute,
    private wishlistService: WishlistService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef // Inyectar ChangeDetectorRef correctamente
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    if (!this.user) {
      this.router.navigate(['/login']);
    } else {
      this.initEditData();
      this.loadPedidos();
      this.loadDeseados();

      // Leer parámetros de la URL para abrir una pestaña específica
      this.route.queryParams.subscribe(params => {
        if (params['tab']) {
          this.activeTab = params['tab'];
          // Asegurar que si entramos por URL a pedidos, se recarguen
          if (this.activeTab === 'pedidos') {
            this.loadPedidos();
          }
          this.cdr.detectChanges(); // Forzar actualización visual
        }
      });
    }
  }

  // Oculta un pedido de la vista del usuario
  ocultarPedido(id: number) {
    if (confirm('¿Estás seguro de que quieres borrar este pedido de tu historial?')) {
      this.orderService.hideOrder(id).subscribe({
        next: (res) => {
          // Recargamos la lista de pedidos
          this.loadPedidos();
        },
        error: (err) => {
          console.error('Error al ocultar el pedido', err);
          alert(err.error?.error || 'No se pudo ocultar el pedido.');
        }
      });
    }
  }

  // Carga el historial de pedidos
  loadPedidos() {
    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.cdr.detectChanges(); // Forzar refresco visual de Angular
      },
      error: (err) => console.error('Error cargando pedidos', err)
    });
  }

  // Calcula la fecha de entrega si no está definida en la BD (retroactividad)
  getDeliveryDate(pedido: any): Date {
    if (pedido.fecha_entrega) return new Date(pedido.fecha_entrega);
    const baseDate = new Date(pedido.fecha || pedido.created_at);
    baseDate.setMonth(baseDate.getMonth() + 1);
    return baseDate;
  }

  // Carga la lista de deseados
  loadDeseados() {
    this.wishlistService.getWishlist().subscribe({
      next: (data) => {
        this.deseados = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando deseados', err)
    });
  }

  // Cambia de pestaña
  setTab(tab: string) {
    this.activeTab = tab;
    // Si cambiamos de pestaña, cerramos el modo edición por seguridad
    this.isEditing = false;
    
    // Forzamos la recarga al hacer clic en las pestañas para asegurar que
    // Angular muestre los datos con un solo clic
    if (tab === 'pedidos') {
      this.loadPedidos();
    } else if (tab === 'deseados') {
      this.loadDeseados();
    }
    this.cdr.detectChanges(); // Refrescar vista
  }

  // Quitar like desde el perfil
  removeLike(productoId: number) {
    this.wishlistService.toggleLike(productoId).subscribe({
      next: (res) => {
        // Recargamos la lista para que desaparezca
        this.loadDeseados();
      },
      error: (err) => console.error('Error al quitar like', err)
    });
  }

  // Prepara los datos para editar
  initEditData() {
    this.editData = { ...this.user };
    this.previewUrl = this.user.foto_perfil || null;
    this.selectedFile = null;
  }

  // Cambia entre modo visualización y edición
  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Si cancela, reseteamos
      this.initEditData();
    }
  }

  // Maneja la selección de un archivo de imagen
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Para previsualizar
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Envía los cambios al backend
  saveChanges() {
    const formData = new FormData();
    formData.append('nombre', this.editData.nombre);
    formData.append('email', this.editData.email);
    formData.append('direccion', this.editData.direccion || '');
    formData.append('pais', this.editData.pais || '');
    formData.append('telefono', this.editData.telefono || '');
    
    // Si eligió archivo, lo adjuntamos
    if (this.selectedFile) {
      formData.append('foto_perfil', this.selectedFile, this.selectedFile.name);
    } else if (this.editData.foto_perfil_url) {
      // O si escribió una URL
      formData.append('foto_perfil', this.editData.foto_perfil_url);
    }

    this.authService.updateProfile(formData).subscribe({
      next: (res) => {
        // Actualizamos nuestro usuario local con lo que devuelve el backend
        this.user = res.usuario;
        this.initEditData();
        this.isEditing = false; // Salimos de modo edición
      },
      error: (err) => {
        console.error('Error al actualizar el perfil', err);
        alert('Hubo un error al guardar los cambios.');
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}

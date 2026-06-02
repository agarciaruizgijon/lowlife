import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // Añadimos RouterModule
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
    private wishlistService: WishlistService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    if (!this.user) {
      this.router.navigate(['/login']);
    } else {
      this.initEditData();
      this.loadPedidos();
      this.loadDeseados();
    }
  }

  // Carga el historial de pedidos
  loadPedidos() {
    this.orderService.getMyOrders().subscribe({
      next: (data) => this.pedidos = data,
      error: (err) => console.error('Error cargando pedidos', err)
    });
  }

  // Carga la lista de deseados
  loadDeseados() {
    this.wishlistService.getWishlist().subscribe({
      next: (data) => this.deseados = data,
      error: (err) => console.error('Error cargando deseados', err)
    });
  }

  // Cambia de pestaña
  setTab(tab: string) {
    this.activeTab = tab;
    // Si cambiamos de pestaña, cerramos el modo edición por seguridad
    this.isEditing = false;
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

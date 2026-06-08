import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-admin-user-management',
  standalone: false,
  templateUrl: './admin-user-management.html',
  styleUrl: './admin-user-management.css',
})
export class AdminUserManagement implements OnInit {
  // Array para almacenar todos los usuarios obtenidos del backend
  users: any[] = [];
  
  // Array para almacenar los usuarios filtrados tras usar la barra de búsqueda
  filteredUsers: any[] = [];
  
  // Término de búsqueda introducido por el administrador
  searchTerm: string = '';
  
  // Array para los usuarios que se muestran en la página actual
  paginatedUsers: any[] = [];
  
  // Variables para la paginación
  currentPage: number = 1;
  itemsPerPage: number = 8; // Mostrar 8 usuarios por página
  totalPages: number = 1;

  // Inyectamos el servicio de usuarios para poder comunicarnos con la API
  constructor(private userService: UserService, private cdr: ChangeDetectorRef) {}

  // Este método se ejecuta al inicializar el componente
  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Obtiene la lista de usuarios desde el backend y la asigna a la variable users.
   * Nos aseguramos de que siempre esté en la página 1 al entrar por primera vez.
   */
  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        // Inicialmente, los usuarios filtrados son todos los usuarios
        this.filteredUsers = [...this.users];
        
        this.calculateTotalPages();
        // Nos aseguramos de estar en la primera página
        if (this.filteredUsers.length > 0 && this.currentPage === 1) {
          this.currentPage = 1;
        }
        // Actualizamos explícitamente el array de usuarios paginados
        this.updatePaginatedUsers();
        this.cdr.detectChanges(); // Asegura que la vista se actualice
        console.log('Usuarios cargados:', this.users);
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
      }
    });
  }

  /**
   * Calcula el número total de páginas en base a los usuarios filtrados y los items por página.
   */
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage) || 1;
    // Si nos quedamos en una página vacía al borrar o filtrar, volvemos a la anterior
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  /**
   * Actualiza el array de usuarios paginados en base a la página actual y usuarios filtrados.
   * Usar un método explícito en lugar de un getter mejora la detección de cambios de Angular.
   */
  updatePaginatedUsers(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  /**
   * Filtra la lista de usuarios según el término de búsqueda ingresado (nombre o email).
   */
  filterUsers(): void {
    const term = this.searchTerm.toLowerCase().trim();
    
    if (term === '') {
      // Si la búsqueda está vacía, restauramos la lista completa
      this.filteredUsers = [...this.users];
    } else {
      // Filtramos por nombre o email que contengan el término
      this.filteredUsers = this.users.filter(user => 
        (user.nombre && user.nombre.toLowerCase().includes(term)) ||
        (user.email && user.email.toLowerCase().includes(term))
      );
    }
    
    // Al filtrar, volvemos siempre a la primera página para mostrar los primeros resultados
    this.currentPage = 1;
    this.calculateTotalPages();
    this.updatePaginatedUsers();
  }

  /**
   * Cambia a la página indicada si es válida.
   */
  goToPage(page: number, event?: Event): void {
    if (event) {
      event.preventDefault(); // Evita que el enlace recargue la página
    }
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Actualizamos los usuarios visibles al cambiar de página
      this.updatePaginatedUsers();
    }
  }

  /**
   * Obtiene un array con los números de las páginas para el iterador del HTML.
   */
  get pagesArray(): number[] {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  /**
   * Elimina un usuario llamando al servicio y luego recarga la lista.
   * @param id El ID del usuario a eliminar
   */
  deleteUser(id: number): void {
    // Pedimos confirmación al administrador antes de borrar
    if (confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      this.userService.deleteUser(id).subscribe({
        next: (response) => {
          console.log('Usuario eliminado', response);
          // Recargamos la lista para que desaparezca el usuario eliminado
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error al eliminar el usuario:', error);
          alert('Hubo un error al intentar eliminar el usuario.');
        }
      });
    }
  }
}

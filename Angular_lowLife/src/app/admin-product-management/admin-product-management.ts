import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService, Product } from '../services/product.service';

@Component({
  selector: 'app-admin-product-management',
  standalone: false,
  templateUrl: './admin-product-management.html',
  styleUrl: './admin-product-management.css',
})
export class AdminProductManagement implements OnInit {
  products: Product[] = [];
  
  // Comentario: Array para almacenar los productos filtrados tras la búsqueda
  filteredProducts: Product[] = [];
  
  // Comentario: Array para los productos que se muestran en la página actual
  paginatedProducts: Product[] = [];
  
  // Comentario: Término de búsqueda introducido por el administrador
  searchTerm: string = '';
  
  // Comentario: Variable para activar el filtro de alertas de stock (< 5)
  showLowStockOnly: boolean = false;
  
  // Comentario: Variables para controlar la paginación de la tabla
  currentPage: number = 1;
  itemsPerPage: number = 8; // Mostraremos 8 productos por página
  totalPages: number = 1;

  constructor(
    private productService: ProductService, 
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Escuchamos los parámetros de la URL para ver si venimos del dashboard con el filtro de stock activado
    this.route.queryParams.subscribe(params => {
      if (params['filter'] === 'low_stock') {
        this.showLowStockOnly = true;
      }
      this.loadProducts();
    });
  }

  /**
   * Comentario: Carga inicial de todos los productos desde el servidor
   */
  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        
        // Comentario: En lugar de asignar directamente todo, llamamos a filterProducts para que aplique
        // la búsqueda actual y el posible filtro de "low_stock"
        this.filterProducts();
        
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching products', err)
    });
  }

  /**
   * Comentario: Filtra los productos basándose en el nombre/categoría y en el filtro de stock bajo
   */
  filterProducts(): void {
    const term = this.searchTerm.toLowerCase().trim();
    
    this.filteredProducts = this.products.filter(product => {
      // Condición de búsqueda por texto
      const matchesSearch = term === '' || 
        (product.name && product.name.toLowerCase().includes(term)) ||
        (product.category && product.category.toLowerCase().includes(term));
        
      // Condición de filtro de stock
      const matchesStock = this.showLowStockOnly ? product.stock < 5 : true;
      
      // Ambas condiciones deben cumplirse
      return matchesSearch && matchesStock;
    });
    
    // Volvemos a la primera página tras aplicar filtros
    this.currentPage = 1;
    this.calculateTotalPages();
    this.updatePaginatedProducts();
  }

  /**
   * Comentario: Calcula el número total de páginas dependiendo de la cantidad de productos filtrados
   */
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage) || 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  /**
   * Comentario: Corta el array de productos para extraer sólo los que tocan en la página actual
   */
  updatePaginatedProducts(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, startIndex + this.itemsPerPage);
  }

  /**
   * Comentario: Función para cambiar de página cuando se clica en la paginación
   */
  goToPage(page: number, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedProducts();
    }
  }

  /**
   * Elimina un producto por su id y actualiza la lista
   */
  deleteProduct(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error al eliminar producto', err);
          alert('Hubo un error al eliminar el producto.');
        }
      });
    }
  }

  /**
   * Comentario: Crea un array con el número de páginas totales para dibujarlo en el HTML
   */
  get pagesArray(): number[] {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }
}

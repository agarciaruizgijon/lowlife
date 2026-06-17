import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-admin-product-edit',
  standalone: false,
  templateUrl: './admin-product-edit.html',
  styleUrl: './admin-product-edit.css'
})
export class AdminProductEdit implements OnInit {
  // Almacena el ID del producto que se está editando (extraído de la URL)
  productId!: number;
  
  // Modelo de datos para almacenar la información actual del producto que se va a editar
  producto: {
    titulo: string;             // Nombre del producto
    descripcion: string;        // Descripción o detalles del producto
    precio: number | null;      // Precio de venta
    estado: string;             // Estado del producto ('draft', 'published', etc.)
    categoria: string;          // Categoría a la que pertenece
    proveedor_nombre: string;   // Nombre del proveedor
    proveedor_email: string;    // Correo del proveedor
    foto_url: string;           // URL de la imagen actual (si la tiene)
  } = {
    titulo: '',
    descripcion: '',
    precio: null,
    estado: 'draft',
    categoria: '',
    proveedor_nombre: '',
    proveedor_email: '',
    foto_url: ''
  };

  // Variables para gestionar la actualización de la imagen (si el usuario decide cambiarla)
  selectedFile: File | null = null; // Archivo de imagen seleccionado desde el ordenador
  imagePreview: string | ArrayBuffer | null = null; // Previsualización de la nueva imagen o de la existente

  // Lista para almacenar y gestionar las variaciones (talla y color) del producto
  variaciones: { talla: string, color_nombre: string, color_hex: string, stock: number }[] = [];
  
  // Modelo temporal para el formulario de agregar una nueva variación
  nuevaVariacion = { talla: '', color_nombre: '', color_hex: '#000000', stock: 0 };

  // Inyectamos el servicio de productos, el enrutador para redireccionar, la ruta activa para leer el ID y ChangeDetectorRef para actualizar la vista
  constructor(
    private productService: ProductService, 
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Se ejecuta automáticamente al cargar el componente.
   * Extrae el ID del producto de la URL y llama a la función para cargar sus datos.
   */
  ngOnInit() {
    // Lee el parámetro 'id' de la URL (ej: /admin-productos/editar/5 -> obtiene el 5)
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.productId) {
      this.loadProduct(); // Si hay un ID válido, carga los datos desde el servidor
    }
  }

  /**
   * Pide al backend los datos del producto específico y rellena el formulario con ellos.
   */
  loadProduct() {
    this.productService.getProduct(this.productId).subscribe({
      next: (data: any) => {
        // Asignamos los datos recibidos al modelo local. 
        // Usamos || (OR) para mapear diferentes nombres de variables posibles devueltos por el backend y asegurar que no haya nulos.
        this.producto.titulo = data.titulo || data.name || '';
        this.producto.descripcion = data.descripcion || '';
        this.producto.precio = data.precio || data.price || 0;
        this.producto.estado = data.estado || 'draft';
        this.producto.categoria = data.categoria || '';
        this.producto.proveedor_nombre = data.proveedor_nombre || '';
        this.producto.proveedor_email = data.proveedor_email || '';
        this.producto.foto_url = data.foto_url || data.image || '';
        
        // Si el producto ya tenía una foto subida, la ponemos como vista previa inicial
        if (this.producto.foto_url) {
            this.imagePreview = this.producto.foto_url;
        }

        // Si el servidor nos devuelve variaciones ya creadas, las cargamos en la lista
        if (data.variaciones && Array.isArray(data.variaciones)) {
            this.variaciones = data.variaciones;
        }

        // Forzamos a Angular a que repinte la pantalla para mostrar los datos que acabamos de cargar
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando producto', err)
    });
  }

  /**
   * Añade la variación actual del formulario a la lista general de variaciones.
   */
  addVariacion() {
    // Validación: Se requiere al menos definir una talla o un color
    if (this.nuevaVariacion.talla.trim() === '' && this.nuevaVariacion.color_nombre.trim() === '') {
      alert('Por favor, ingresa al menos una talla o un color.');
      return;
    }
    // Validación: El stock introducido no puede ser negativo
    if (this.nuevaVariacion.stock < 0) {
      alert('El stock no puede ser negativo.');
      return;
    }
    
    // Añade una copia de la nueva variación al listado usando el operador spread (...)
    this.variaciones.push({ ...this.nuevaVariacion });
    
    // Reinicia los inputs para permitir añadir la siguiente variación rápidamente
    this.nuevaVariacion.talla = '';
    this.nuevaVariacion.color_nombre = '';
    this.nuevaVariacion.stock = 0;
  }

  /**
   * Elimina una variación específica de la lista (ya sea existente o recién añadida).
   */
  removeVariacion(index: number) {
    this.variaciones.splice(index, 1);
  }

  /**
   * Se ejecuta cuando el usuario selecciona una nueva imagen de su ordenador para reemplazar la actual.
   */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file; // Guarda el nuevo archivo a subir
      this.producto.foto_url = ''; // Borra la URL antigua localmente porque ahora se subirá una foto nueva
      
      // Crea un lector para cargar la imagen en memoria y poder mostrar la nueva previsualización
      const reader = new FileReader();
      reader.onload = e => this.imagePreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  /**
   * Envía los datos actualizados al backend mediante una petición para guardar los cambios.
   */
  onSubmit() {
    // Usamos FormData para poder enviar tanto texto normal como la posible nueva imagen (archivo)
    const formData = new FormData();
    
    // Adjuntamos los datos básicos modificados al formulario
    formData.append('titulo', this.producto.titulo);
    formData.append('descripcion', this.producto.descripcion);
    formData.append('precio', this.producto.precio?.toString() || '0');
    
    // Condicionales para asegurar que no se envían datos nulos a la API
    if (this.producto.estado) formData.append('estado', this.producto.estado);
    if (this.producto.categoria) formData.append('categoria', this.producto.categoria);
    if (this.producto.proveedor_nombre) formData.append('proveedor_nombre', this.producto.proveedor_nombre);
    if (this.producto.proveedor_email) formData.append('proveedor_email', this.producto.proveedor_email);

    // Adjuntamos la lista completa de variaciones actualizada convirtiéndola a formato JSON de texto
    if (this.variaciones.length > 0) {
      formData.append('variaciones', JSON.stringify(this.variaciones));
    }

    // Lógica para enviar la nueva foto o mantener la anterior:
    if (this.selectedFile) {
      // Si el usuario seleccionó una NUEVA foto desde su PC, enviamos el archivo físico
      formData.append('foto_url', this.selectedFile);
    } else if (this.producto.foto_url) {
      // Si no seleccionó nueva foto, pero la anterior sigue ahí (enlace), reenviamos la URL para que no se borre en el servidor
      formData.append('foto_url', this.producto.foto_url);
    }

    // Llamamos a la API para actualizar el registro (updateProduct) usando el ID numérico del producto
    this.productService.updateProduct(this.productId, formData).subscribe({
      next: (res) => {
        // Éxito: avisamos al administrador y redirigimos a la tabla general de productos
        alert('Producto actualizado exitosamente!');
        this.router.navigate(['/admin-productos']);
      },
      error: (err) => {
        // Error: mostramos los problemas devueltos por el backend (ej: validaciones fallidas como "el precio es requerido")
        console.error('Error al actualizar producto', err);
        let errorMsg = 'Ocurrió un error al actualizar el producto.';
        if (err.error && err.error.errors) {
            errorMsg += '\n' + JSON.stringify(err.error.errors);
        } else if (err.error && err.error.message) {
            errorMsg += '\n' + err.error.message;
        }
        alert(errorMsg);
      }
    });
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-admin-product-creation',
  standalone: false,
  templateUrl: './admin-product-creation.html',
  styleUrl: './admin-product-creation.css'
})
export class AdminProductCreation {
  // Modelo de datos inicial para el nuevo producto que se va a crear
  producto: {
    titulo: string;             // Nombre del producto
    descripcion: string;        // Descripción o detalles del producto
    precio: number | null;      // Precio de venta
    estado: string;             // Estado del producto ('draft', 'published', etc.)
    categoria: string;          // Categoría a la que pertenece (ej. 'Camisetas')
    proveedor_nombre: string;   // Nombre del proveedor del producto
    proveedor_email: string;    // Correo de contacto del proveedor
    foto_url: string;           // URL de la imagen (si se provee por enlace en lugar de subir un archivo)
  } = {
    titulo: '',
    descripcion: '',
    precio: null,
    estado: 'draft',            // Por defecto, se crea en estado borrador
    categoria: '',
    proveedor_nombre: '',
    proveedor_email: '',
    foto_url: ''
  };

  // Variables para gestionar la subida de una imagen local
  selectedFile: File | null = null; // Guarda el archivo de imagen que selecciona el usuario
  imagePreview: string | ArrayBuffer | null = null; // Previsualización en base64 de la imagen seleccionada

  // Lista para almacenar las variaciones (combinaciones de talla y color) que se añadirán al producto
  variaciones: { talla: string, color_nombre: string, color_hex: string, stock: number }[] = [];
  
  // Modelo temporal para el formulario de agregar una nueva variación
  nuevaVariacion = { talla: '', color_nombre: '', color_hex: '#000000', stock: 0 };

  // Inyectamos el servicio de productos para la API y el enrutador para redireccionar
  constructor(private productService: ProductService, private router: Router) {}

  /**
   * Añade la variación actual del formulario a la lista general de variaciones.
   */
  addVariacion() {
    // Validación: Se requiere al menos definir una talla o un color para crear la variación
    if (this.nuevaVariacion.talla.trim() === '' && this.nuevaVariacion.color_nombre.trim() === '') {
      alert('Por favor, ingresa al menos una talla o un color.');
      return;
    }
    // Validación: El stock introducido no puede ser un número negativo
    if (this.nuevaVariacion.stock < 0) {
      alert('El stock no puede ser negativo.');
      return;
    }
    
    // Añade una copia de la nueva variación a la lista (usamos el operador spread ... para copiar los valores)
    this.variaciones.push({ ...this.nuevaVariacion });
    
    // Reinicia los campos del formulario de variaciones para permitir agregar la siguiente
    this.nuevaVariacion.talla = '';
    this.nuevaVariacion.color_nombre = '';
    this.nuevaVariacion.stock = 0;
  }

  /**
   * Elimina una variación específica de la lista en base a su posición (index).
   */
  removeVariacion(index: number) {
    this.variaciones.splice(index, 1);
  }

  /**
   * Se ejecuta cuando el usuario selecciona una imagen de su ordenador.
   * Guarda el archivo y genera una URL de previsualización.
   */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file; // Guarda el archivo físico
      this.producto.foto_url = ''; // Limpia el campo de URL externa, ya que ahora se usará un archivo local
      
      // Crea un lector para cargar la imagen en memoria y poder mostrarla en la pantalla (Preview)
      const reader = new FileReader();
      reader.onload = e => this.imagePreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  /**
   * Envía todos los datos del formulario al backend para crear el producto.
   */
  onSubmit() {
    // Usamos FormData en lugar de un objeto JSON normal porque necesitamos enviar un archivo (la imagen)
    const formData = new FormData();
    
    // Añadimos los datos básicos del producto
    formData.append('titulo', this.producto.titulo);
    formData.append('descripcion', this.producto.descripcion);
    formData.append('precio', this.producto.precio?.toString() || '0');
    
    // Solo añadimos los campos si tienen algún valor (para evitar enviar nulos o vacíos indeseados)
    if (this.producto.estado) formData.append('estado', this.producto.estado);
    if (this.producto.categoria) formData.append('categoria', this.producto.categoria);
    if (this.producto.proveedor_nombre) formData.append('proveedor_nombre', this.producto.proveedor_nombre);
    if (this.producto.proveedor_email) formData.append('proveedor_email', this.producto.proveedor_email);

    // Si hay variaciones, las convertimos a una cadena de texto (JSON) para poder enviarlas por FormData
    if (this.variaciones.length > 0) {
      formData.append('variaciones', JSON.stringify(this.variaciones));
    }

    // Lógica para enviar la foto:
    if (this.selectedFile) {
      // Si el usuario subió un archivo desde su PC, enviamos ese archivo físico
      formData.append('foto_url', this.selectedFile);
    } else if (this.producto.foto_url) {
      // Si no subió un archivo, pero sí puso un enlace de internet, enviamos el enlace
      formData.append('foto_url', this.producto.foto_url);
    }

    // Llamamos al servicio (que hará la petición POST a Laravel) enviando los datos empaquetados en formData
    this.productService.createProduct(formData).subscribe({
      next: (res) => {
        // Si todo sale bien, avisa al usuario y lo devuelve a la lista de productos
        alert('Producto creado exitosamente!');
        this.router.navigate(['/admin-productos']);
      },
      error: (err) => {
        // Si algo falla, intenta extraer el mensaje de error del backend para mostrárselo al usuario
        console.error('Error al crear producto', err);
        let errorMsg = 'Ocurrió un error al crear el producto.';
        if (err.error && err.error.errors) {
            // Errores de validación de Laravel (ej: "El precio es obligatorio")
            errorMsg += '\n' + JSON.stringify(err.error.errors);
        } else if (err.error && err.error.message) {
            // Mensaje de error general del servidor
            errorMsg += '\n' + err.error.message;
        }
        alert(errorMsg); // Muestra la alerta de error al administrador
      }
    });
  }
}

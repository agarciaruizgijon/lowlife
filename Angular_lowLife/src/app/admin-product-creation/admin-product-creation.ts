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
  producto: {
    titulo: string;
    descripcion: string;
    precio: number | null;
    estado: string;
    categoria: string;
    proveedor_nombre: string;
    proveedor_email: string;
    foto_url: string;
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

  // Archivo seleccionado
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  // Variaciones
  variaciones: { talla: string, color_nombre: string, color_hex: string, stock: number }[] = [];
  nuevaVariacion = { talla: '', color_nombre: '', color_hex: '#000000', stock: 0 };

  constructor(private productService: ProductService, private router: Router) {}

  addVariacion() {
    if (this.nuevaVariacion.talla.trim() === '' && this.nuevaVariacion.color_nombre.trim() === '') {
      alert('Por favor, ingresa al menos una talla o un color.');
      return;
    }
    if (this.nuevaVariacion.stock < 0) {
      alert('El stock no puede ser negativo.');
      return;
    }
    this.variaciones.push({ ...this.nuevaVariacion });
    // Reset inputs
    this.nuevaVariacion.talla = '';
    this.nuevaVariacion.color_nombre = '';
    this.nuevaVariacion.stock = 0;
  }

  removeVariacion(index: number) {
    this.variaciones.splice(index, 1);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.producto.foto_url = ''; // Limpiar la URL si se elige un archivo local
      
      const reader = new FileReader();
      reader.onload = e => this.imagePreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('titulo', this.producto.titulo);
    formData.append('descripcion', this.producto.descripcion);
    formData.append('precio', this.producto.precio?.toString() || '0');
    if (this.producto.estado) formData.append('estado', this.producto.estado);
    if (this.producto.categoria) formData.append('categoria', this.producto.categoria);
    if (this.producto.proveedor_nombre) formData.append('proveedor_nombre', this.producto.proveedor_nombre);
    if (this.producto.proveedor_email) formData.append('proveedor_email', this.producto.proveedor_email);

    if (this.variaciones.length > 0) {
      formData.append('variaciones', JSON.stringify(this.variaciones));
    }

    if (this.selectedFile) {
      formData.append('foto_url', this.selectedFile);
    } else if (this.producto.foto_url) {
      formData.append('foto_url', this.producto.foto_url);
    }

    this.productService.createProduct(formData).subscribe({
      next: (res) => {
        alert('Producto creado exitosamente!');
        this.router.navigate(['/admin-productos']);
      },
      error: (err) => {
        console.error('Error al crear producto', err);
        let errorMsg = 'Ocurrió un error al crear el producto.';
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

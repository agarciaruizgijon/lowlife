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
    stock: number | null;
    estado: string;
    categoria: string;
    proveedor_nombre: string;
    proveedor_email: string;
    foto_url: string;
  } = {
    titulo: '',
    descripcion: '',
    precio: null,
    stock: null,
    estado: 'draft',
    categoria: '',
    proveedor_nombre: '',
    proveedor_email: '',
    foto_url: ''
  };

  // Archivo seleccionado
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  // Tallas disponibles
  tallasOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unitalla'];
  selectedTallas: string[] = [];

  // Selector dinámico de colores
  currentColor: string = '#000000';
  currentColorName: string = '';
  selectedColors: { name: string, hex: string }[] = [];

  constructor(private productService: ProductService, private router: Router) {}

  toggleTalla(talla: string) {
    const index = this.selectedTallas.indexOf(talla);
    if (index > -1) {
      this.selectedTallas.splice(index, 1);
    } else {
      this.selectedTallas.push(talla);
    }
  }

  addColor() {
    if (this.currentColorName.trim() !== '' && !this.selectedColors.some(c => c.hex === this.currentColor)) {
      this.selectedColors.push({ name: this.currentColorName, hex: this.currentColor });
      this.currentColorName = ''; // reset after add
    } else if (this.currentColorName.trim() === '') {
      alert('Por favor, ingresa un nombre para el color.');
    }
  }

  removeColor(colorHex: string) {
    this.selectedColors = this.selectedColors.filter(c => c.hex !== colorHex);
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
    formData.append('stock', this.producto.stock?.toString() || '0');
    if (this.producto.estado) formData.append('estado', this.producto.estado);
    if (this.producto.categoria) formData.append('categoria', this.producto.categoria);
    if (this.producto.proveedor_nombre) formData.append('proveedor_nombre', this.producto.proveedor_nombre);
    if (this.producto.proveedor_email) formData.append('proveedor_email', this.producto.proveedor_email);

    if (this.selectedTallas.length > 0) {
      formData.append('tallas', this.selectedTallas.join(','));
    }

    if (this.selectedColors.length > 0) {
      formData.append('colores', JSON.stringify(this.selectedColors));
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

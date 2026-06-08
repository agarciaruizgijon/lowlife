import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-admin-user-edit',
  standalone: false,
  templateUrl: './admin-user-edit.html',
  styleUrl: './admin-user-edit.css',
})
export class AdminUserEdit implements OnInit {
  userId: number | null = null;
  user: any = {
    id: 0,
    nombre: '', // Nombre del usuario
    email: '', // Correo electrónico
    direccion: '', // Dirección física (puede ser null para otros usuarios)
    pais: '', // País de residencia
    telefono: '', // Teléfono de contacto
    rol: 'usuario', // Rol en el sistema (admin o usuario)
    updated_at: '', // Fecha de última actualización o acceso
    foto_perfil: '' // Foto de perfil, si tiene
  };

  // Variable para almacenar el archivo de imagen que el usuario quiere subir
  selectedFile: File | null = null;
  // Variable para previsualizar la imagen seleccionada antes de guardarla
  previewUrl: string | null = null;

  // El constructor inyecta las dependencias necesarias:
  // - route: Para obtener el parámetro de ID de la URL
  // - router: Para redirigir en caso de error o después de guardar
  // - userService: Servicio para comunicarse con el backend y obtener los datos del usuario
  // - cdr: Servicio para forzar la actualización de la vista
  constructor(private route: ActivatedRoute, private router: Router, private userService: UserService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Capturamos el ID del usuario que viene en la ruta (ej. /admin-editarUsuario/2)
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.userId = +idParam; // Convertimos el string a número
      // Cargamos los datos correspondientes a este ID
      this.loadUserData(this.userId);
    }
  }

  // Este método hace una petición al backend para cargar los datos completos
  // de CUALQUIER usuario, independientemente de si es admin o no.
  // Como la ruta apiResource de usuarios no está protegida por auth:sanctum en la API,
  // el administrador puede ver y cargar los datos (como país, dirección, etc.) de cualquier ID.
  loadUserData(id: number): void {
    this.userService.getUser(id).subscribe({
      next: (data) => {
        this.user = data;
        this.cdr.detectChanges(); // Forzamos la actualización de la vista
        console.log('Usuario cargado:', this.user);
      },
      error: (error) => {
        console.error('Error al cargar el usuario:', error);
        alert('Hubo un error al cargar los datos del usuario.');
        this.router.navigate(['/admin-gestionUsuario']);
      }
    });
  }

  // Método que se ejecuta cuando el usuario selecciona una nueva foto
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Crear una URL temporal para previsualizar la imagen inmediatamente
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Método que se ejecuta cuando el administrador escribe manualmente una URL de imagen
  // Si escribe una URL, debemos olvidar cualquier archivo local que hubiera intentado subir antes
  onUrlChanged(): void {
    this.selectedFile = null;
    this.previewUrl = null; // Al quitar el preview, la vista mostrará la nueva URL automáticamente
  }

  // Método llamado al enviar el formulario (click en Guardar Cambios)
  // Actualiza los datos editados en la base de datos a través de la API
  saveChanges(): void {
    if (!this.userId) return;

    // Usamos FormData porque vamos a enviar posiblemente un archivo (la foto)
    const formData = new FormData();
    
    // Añadimos los datos de texto al FormData
    formData.append('nombre', this.user.nombre || '');
    formData.append('email', this.user.email || '');
    formData.append('rol', this.user.rol || 'usuario');
    if (this.user.direccion) formData.append('direccion', this.user.direccion);
    if (this.user.pais) formData.append('pais', this.user.pais);
    if (this.user.telefono) formData.append('telefono', this.user.telefono);
    
    // Si se ha seleccionado un archivo local nuevo, lo añadimos al FormData como binario
    if (this.selectedFile) {
      formData.append('foto_perfil', this.selectedFile);
    } 
    // Si no hay archivo, pero sí hay una URL escrita o existente, la enviamos como texto plano
    else if (this.user.foto_perfil) {
      formData.append('foto_perfil', this.user.foto_perfil);
    }

    // Llamamos al método updateUserWithFile del servicio
    this.userService.updateUserWithFile(this.userId, formData).subscribe({
      next: (response) => {
        console.log('Usuario actualizado:', response);
        alert('Cambios guardados con éxito');
        // Redirigimos al administrador a la tabla de usuarios
        this.router.navigate(['/admin-gestionUsuario']);
      },
      error: (error) => {
        console.error('Error al actualizar el usuario:', error);
        alert('Hubo un error al intentar guardar los cambios.');
      }
    });
  }

  // Método llamado al hacer clic en el botón "Eliminar Usuario"
  // Permite borrar la cuenta actual que se está editando
  deleteUser(): void {
    if (!this.userId) return;

    // Pedimos confirmación antes de ejecutar el borrado (para evitar clicks accidentales)
    if (confirm('¿Estás seguro de que quieres eliminar este usuario permanentemente? Esta acción no se puede deshacer.')) {
      this.userService.deleteUser(this.userId).subscribe({
        next: (response) => {
          console.log('Usuario eliminado:', response);
          alert('El usuario ha sido eliminado correctamente.');
          // Volvemos a la lista general después de borrar
          this.router.navigate(['/admin-gestionUsuario']);
        },
        error: (error) => {
          console.error('Error al eliminar el usuario:', error);
          alert('Ocurrió un error al intentar borrar el usuario.');
        }
      });
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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
    name: '',
    email: '',
    role: 'Usuario',
    status: 'Activo',
    lastLogin: ''
  };

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.userId = +idParam;
      this.loadUserData(this.userId);
    }
  }

  loadUserData(id: number): void {
    // En una aplicación real, esto vendría de un servicio
    const mockUsers = [
      { id: 1, name: 'Víctor García', email: 'victor@example.com', role: 'Admin', status: 'Activo', lastLogin: 'Hace 2 horas' },
      { id: 2, name: 'Laura Martínez', email: 'laura@example.com', role: 'Usuario', status: 'Activo', lastLogin: 'Ayer' },
      { id: 3, name: 'Carlos López', email: 'carlos@example.com', role: 'Usuario', status: 'Inactivo', lastLogin: 'Hace 1 semana' },
      { id: 4, name: 'Ana Fernández', email: 'ana@example.com', role: 'Editor', status: 'Activo', lastLogin: 'Hace 5 horas' }
    ];

    const foundUser = mockUsers.find(u => u.id === id);
    if (foundUser) {
      this.user = { ...foundUser };
    }
  }

  saveChanges(): void {
    console.log('Guardando cambios del usuario:', this.user);
    // Aquí iría la lógica para llamar a un servicio API
    alert('Cambios guardados con éxito');
    this.router.navigate(['/admin-gestionUsuario']);
  }
}

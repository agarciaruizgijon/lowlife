import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-user-management',
  standalone: false,
  templateUrl: './admin-user-management.html',
  styleUrl: './admin-user-management.css',
})
export class AdminUserManagement {
  users = [
    { id: 1, name: 'Víctor García', email: 'victor@example.com', role: 'Admin', status: 'Activo', lastLogin: 'Hace 2 horas' },
    { id: 2, name: 'Laura Martínez', email: 'laura@example.com', role: 'Usuario', status: 'Activo', lastLogin: 'Ayer' },
    { id: 3, name: 'Carlos López', email: 'carlos@example.com', role: 'Usuario', status: 'Inactivo', lastLogin: 'Hace 1 semana' },
    { id: 4, name: 'Ana Fernández', email: 'ana@example.com', role: 'Editor', status: 'Activo', lastLogin: 'Hace 5 horas' }
  ];
}

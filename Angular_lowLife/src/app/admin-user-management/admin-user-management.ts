import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-user-management',
  standalone: false,
  templateUrl: './admin-user-management.html',
  styleUrl: './admin-user-management.css',
})
export class AdminUserManagement {
  users = [
    { id: 1, name: 'Víctor García', email: 'victor@example.com', role: 'Admin', status: 'Activo', lastLogin: 'Hace 2 horas', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80' },
    { id: 2, name: 'Laura Martínez', email: 'laura@example.com', role: 'Usuario', status: 'Activo', lastLogin: 'Ayer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
    { id: 3, name: 'Carlos López', email: 'carlos@example.com', role: 'Usuario', status: 'Inactivo', lastLogin: 'Hace 1 semana', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
    { id: 4, name: 'Ana Fernández', email: 'ana@example.com', role: 'Editor', status: 'Activo', lastLogin: 'Hace 5 horas', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80' }
  ];
}

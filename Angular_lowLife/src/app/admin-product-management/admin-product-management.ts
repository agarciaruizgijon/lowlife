import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-product-management',
  standalone: false,
  templateUrl: './admin-product-management.html',
  styleUrl: './admin-product-management.css',
})
export class AdminProductManagement implements OnInit {
  products = [
    { id: 101, name: 'Camiseta Básica Negra', price: '19.99€', stock: 45, status: 'Activo', category: 'Camisetas' },
    { id: 102, name: 'Sudadera con Capucha', price: '39.99€', stock: 12, status: 'Activo', category: 'Sudaderas' },
    { id: 103, name: 'Pantalón Cargo', price: '49.99€', stock: 0, status: 'Agotado', category: 'Pantalones' },
    { id: 104, name: 'Gorra Logo', price: '15.99€', stock: 30, status: 'Activo', category: 'Accesorios' },
    { id: 105, name: 'Chaqueta Vaquera', price: '59.99€', stock: 5, status: 'Activo', category: 'Chaquetas' }
  ];

  ngOnInit(): void {}
}

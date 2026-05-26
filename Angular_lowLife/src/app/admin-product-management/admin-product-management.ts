import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-product-management',
  standalone: false,
  templateUrl: './admin-product-management.html',
  styleUrl: './admin-product-management.css',
})
export class AdminProductManagement implements OnInit {
  products = [
    { id: 101, name: 'Camiseta Básica Negra', price: '19.99€', stock: 45, status: 'Activo', category: 'Camisetas', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80' },
    { id: 102, name: 'Sudadera con Capucha', price: '39.99€', stock: 12, status: 'Activo', category: 'Sudaderas', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80' },
    { id: 103, name: 'Pantalón Cargo', price: '49.99€', stock: 0, status: 'Agotado', category: 'Pantalones', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80' },
    { id: 104, name: 'Gorra Logo', price: '15.99€', stock: 30, status: 'Activo', category: 'Accesorios', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=500&q=80' },
    { id: 105, name: 'Chaqueta Vaquera', price: '59.99€', stock: 5, status: 'Activo', category: 'Chaquetas', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80' }
  ];

  ngOnInit(): void {}
}

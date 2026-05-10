import { Component } from '@angular/core';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
  standalone: false
})
export class Cart {
  // Mock data para los productos recomendados como en la imagen
  recomendados = [
    {
      name: "Zapatillas Urban",
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=500&q=80"
    },
    {
      name: "Equipación Brasil",
      image: "https://images.unsplash.com/photo-1583316174775-bd6dc0e9f298?auto=format&fit=crop&w=500&q=80"
    },
    {
      name: "Sudadera Casual",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80"
    }
  ];
}

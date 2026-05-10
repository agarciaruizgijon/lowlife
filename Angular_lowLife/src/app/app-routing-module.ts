import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StyleGuide } from './style-guide/style-guide';
import { Index } from './index/index';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { ProductDetail } from './product-detail/product-detail';
import { Cart } from './cart/cart';

const routes: Routes = [
  { path: 'guia-estilos', component: StyleGuide },
  { path: 'index', component: Index },
  { path: 'login', component: Login },
  { path: 'registro', component: Register },
  { path: 'producto', component: ProductDetail },
  { path: 'carrito', component: Cart },
  { path: '', redirectTo: '/index', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

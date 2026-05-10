import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StyleGuide } from './style-guide/style-guide';
import { Login } from './auth/login/login';
import { ProductDetail } from './product-detail/product-detail';

const routes: Routes = [
  { path: 'guia-estilos', component: StyleGuide },
  { path: 'login', component: Login },
  { path: 'producto', component: ProductDetail },
  { path: '', redirectTo: '/producto', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

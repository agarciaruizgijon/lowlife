import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StyleGuide } from './style-guide/style-guide';
import { Index } from './index/index';
import { Login } from './auth/login/login';
import { ProductDetail } from './product-detail/product-detail';

const routes: Routes = [
  { path: 'guia-estilos', component: StyleGuide },
  { path: 'index', component: Index },
  { path: 'login', component: Login },
<<<<<<< HEAD
  { path: 'producto', component: ProductDetail },
  { path: '', redirectTo: '/producto', pathMatch: 'full' }
=======
  { path: '', redirectTo: '/index', pathMatch: 'full' }
>>>>>>> 709ca5f5dff60765cbf622adc00795498ed5b007
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

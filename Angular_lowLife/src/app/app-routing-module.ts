import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StyleGuide } from './style-guide/style-guide';
import { Login } from './auth/login/login';

const routes: Routes = [
  { path: 'guia-estilos', component: StyleGuide },
  { path: 'login', component: Login },
  { path: '', redirectTo: '/guia-estilos', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

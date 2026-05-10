import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StyleGuide } from './style-guide/style-guide';
import { Index } from './index/index';

const routes: Routes = [
  { path: 'guia-estilos', component: StyleGuide },
  { path: 'index', component: Index },
  { path: '', redirectTo: '/index', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

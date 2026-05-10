import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { StyleGuide } from './style-guide/style-guide';
import { Index } from './index/index';
import { Login } from './auth/login/login';
import { ProductDetail } from './product-detail/product-detail';

@NgModule({
<<<<<<< HEAD
  declarations: [App, StyleGuide, Login, ProductDetail],
=======
  declarations: [App, StyleGuide, Index, Login],
>>>>>>> 709ca5f5dff60765cbf622adc00795498ed5b007
  imports: [BrowserModule, AppRoutingModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}

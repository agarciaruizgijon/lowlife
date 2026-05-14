import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { StyleGuide } from './style-guide/style-guide';
import { Index } from './index/index';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { ProductDetail } from './product-detail/product-detail';

import { Cart } from './cart/cart';
import { Contact } from './contact/contact';
import { About } from './about/about';
import { PaymentMethod } from './payment-method/payment-method';
import { AdminUserManagement } from './admin-user-management/admin-user-management';
import { AdminProductCreation } from './admin-product-creation/admin-product-creation';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { AdminProductManagement } from './admin-product-management/admin-product-management';
import { AdminProductEdit } from './admin-product-edit/admin-product-edit';

@NgModule({
  declarations: [
    App,
    StyleGuide,
    Index,
    Login,
    ProductDetail,
    Cart,
    Register,
    Contact,
    About,
    PaymentMethod,
    AdminUserManagement,
    AdminProductCreation,
    AdminDashboard,
    AdminProductManagement,
    AdminProductEdit,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}

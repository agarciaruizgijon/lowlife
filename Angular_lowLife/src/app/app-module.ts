import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { StyleGuide } from './style-guide/style-guide';
import { Index } from './index/index';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { ProductDetail } from './product-detail/product-detail';
import { AuthCallbackComponent } from './auth/auth-callback/auth-callback.component';

import { Cart } from './cart/cart';
import { Contact } from './contact/contact';
import { About } from './about/about';
import { PaymentMethod } from './payment-method/payment-method';
import { ShippingAddress } from './shipping-address/shipping-address';
import { AdminUserManagement } from './admin-user-management/admin-user-management';
import { AdminProductCreation } from './admin-product-creation/admin-product-creation';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { AdminProductManagement } from './admin-product-management/admin-product-management';
import { AdminProductEdit } from './admin-product-edit/admin-product-edit';
import { AdminUserEdit } from './admin-user-edit/admin-user-edit';
import { AdminOrders } from './admin-orders/admin-orders';
import { AdminOrderEdit } from './admin-order-edit/admin-order-edit';

@NgModule({
  declarations: [
    App,
    StyleGuide,
    Index,
    Login,
    ProductDetail,
    Cart,
    Register,
    AuthCallbackComponent,
    Contact,
    About,
    PaymentMethod,
    ShippingAddress,
    AdminUserManagement,
    AdminProductCreation,
    AdminDashboard,
    AdminProductManagement,
    AdminProductEdit,
    AdminUserEdit,
    AdminOrders,
    AdminOrderEdit,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [provideBrowserGlobalErrorListeners(), provideHttpClient()],
  bootstrap: [App],
})
export class AppModule {}

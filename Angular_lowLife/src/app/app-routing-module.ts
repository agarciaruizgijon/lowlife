import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StyleGuide } from './style-guide/style-guide';
import { Index } from './index/index';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { ProductDetail } from './product-detail/product-detail';
import { Cart } from './cart/cart';
import { Contact } from './contact/contact';
import { About } from './about/about';
import { PaymentMethod } from './payment-method/payment-method';
import { ShippingAddress } from './shipping-address/shipping-address';
import { Perfil } from './perfil/perfil';
import { AuthCallbackComponent } from './auth/auth-callback/auth-callback.component';

import { AdminUserManagement } from './admin-user-management/admin-user-management';
import { AdminProductCreation } from './admin-product-creation/admin-product-creation';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { AdminProductManagement } from './admin-product-management/admin-product-management';
import { AdminProductEdit } from './admin-product-edit/admin-product-edit';
import { AdminUserEdit } from './admin-user-edit/admin-user-edit';
import { AdminOrders } from './admin-orders/admin-orders';
import { AdminOrderEdit } from './admin-order-edit/admin-order-edit';

const routes: Routes = [
  { path: 'guia-estilos', component: StyleGuide },
  { path: 'index', component: Index },
  { path: 'login', component: Login },
  { path: 'registro', component: Register },
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: 'perfil', component: Perfil }, // Añadimos la ruta para acceder a /perfil
  { path: 'producto/:id', component: ProductDetail },
  { path: 'carrito', component: Cart },
  { path: 'contacto', component: Contact },
  { path: 'nosotros', component: About },
  { path: 'direccion-envio', component: ShippingAddress },
  { path: 'metodo-pago', component: PaymentMethod },
  { path: 'admin-gestionUsuario', component: AdminUserManagement },
  { path: 'admin-productos', component: AdminProductManagement },
  { path: 'admin-crearProducto', component: AdminProductCreation },
  { path: 'admin-editarProducto/:id', component: AdminProductEdit },
  { path: 'admin-editarUsuario/:id', component: AdminUserEdit },
  { path: 'admin-pedidos', component: AdminOrders },
  { path: 'admin-editarPedido/:id', component: AdminOrderEdit },
  { path: 'admin-dashboard', component: AdminDashboard },
  { path: '', redirectTo: '/index', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

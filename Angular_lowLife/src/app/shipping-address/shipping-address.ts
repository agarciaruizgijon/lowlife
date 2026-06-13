import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-shipping-address',
  standalone: false,
  templateUrl: './shipping-address.html',
  styleUrls: ['./shipping-address.css']
})
export class ShippingAddress implements OnInit {
  // Objeto para almacenar los datos del formulario de envío
  shippingData: any = {
    nombre: '',
    apellidos: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    telefono: ''
  };

  // Inyectamos el AuthService para los datos y Router para la navegación programática
  constructor(private authService: AuthService, private router: Router) {}

  // Este método se ejecuta automáticamente cuando el componente se inicializa
  ngOnInit(): void {
    // Obtenemos la información del usuario desde el servicio de autenticación
    const user = this.authService.getUser();
    
    // Si hay un usuario, rellenamos automáticamente los campos de nuestro formulario
    if (user) {
      this.shippingData.nombre = user.nombre || '';
      // Como el backend actualmente no diferencia nombre/apellidos ni ciudad/CP, 
      // dejamos los que no están mapeados vacíos para que los rellene el usuario si es necesario,
      // o le asignamos lo que haya en la BD.
      this.shippingData.direccion = user.direccion || '';
      this.shippingData.telefono = user.telefono || '';
    }
  }

  // Función que se ejecuta al darle al botón 'Continuar al método de pago'
  continuarAlPago(): void {
    // Guardamos los datos de envío en el localStorage para usarlos luego en el componente de pago
    localStorage.setItem('shippingData', JSON.stringify(this.shippingData));

    // Navegamos al método de pago
    this.router.navigate(['/metodo-pago']);
  }
}

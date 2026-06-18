import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.html',
  standalone: false,
  styleUrl: './contact.css'
})
export class Contact {
  contactName: string = '';
  contactEmail: string = '';
  contactMessage: string = '';
  submitted: boolean = false;

  async onSubmit(event: Event) {
    event.preventDefault();
    if (this.contactName && this.contactEmail && this.contactMessage) {

      const response = await fetch('https://formspree.io/f/mlgkyaej', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: this.contactName,
          email: this.contactEmail,
          message: this.contactMessage
        })
      });

      if (response.ok) {
        this.submitted = true;
        // borrar el formulario cuando pasen 4 segundos
        setTimeout(() => {
          this.submitted = false;
          this.contactName = '';
          this.contactEmail = '';
          this.contactMessage = '';
        }, 4000);
      } else {
        alert('Hubo un problema al enviar el mensaje. Inténtalo de nuevo.');
      }

    }
  }
}

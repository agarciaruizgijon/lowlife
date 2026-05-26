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

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.contactName && this.contactEmail && this.contactMessage) {
      this.submitted = true;
      // Reset form after 4 seconds
      setTimeout(() => {
        this.submitted = false;
        this.contactName = '';
        this.contactEmail = '';
        this.contactMessage = '';
      }, 4000);
    }
  }
}

import { Component, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Angular_lowLife');
  isNavbarOpen: boolean = false;

  constructor(public router: Router) {
    // Close navbar on route change
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isNavbarOpen = false;
      }
    });
  }

  isLoginPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/registro';
  }

  toggleNavbar() {
    this.isNavbarOpen = !this.isNavbarOpen;
  }

  closeNavbar() {
    this.isNavbarOpen = false;
  }
}

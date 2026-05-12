import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  message = signal('Conectando con backend...');

  constructor() {
    this.loadBackendMessage();
  }

  async loadBackendMessage() {
    try {
      const apiBase =
        window.location.port === '4200' ? `http://${window.location.hostname}:8000` : '';
      const response = await fetch(`${apiBase}/api/health`);
      const data = await response.json();
      console.log(data);
      this.message.set(data.message);
      console.log(this.message());
    } catch (error) {
      console.error(error);
      this.message.set('Error conectando backend');
    }
  }
}

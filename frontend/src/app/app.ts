import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  message = signal('Conectando con backend...');

  constructor(private apiService: ApiService) {
    this.loadBackendMessage();
  }

  async loadBackendMessage() {
    try {
      const data = await this.apiService.getHealth();
      this.message.set(data.message);
    } catch (error) {
      console.error(error);
      this.message.set('Error conectando backend');
    }
  }
}

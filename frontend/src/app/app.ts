import { Component, signal } from '@angular/core';
import { ApiService } from './services/api.service';
import { CameraComponent } from './components/camera/camera';

@Component({
  selector: 'app-root',
  imports: [CameraComponent],
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
      console.log(data);
      this.message.set(data.message);
      console.log(this.message());
    } catch (error) {
      console.error(error);
      this.message.set('Error conectando backend');
    }
  }
}


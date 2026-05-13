import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

type HealthStatus = 'checking' | 'ok' | 'error';

interface HealthCheck {
  label: string;
  status: HealthStatus;
  detail: string;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
})
export class HomePage {
  healthChecks = signal<HealthCheck[]>([
    {
      label: 'Backend',
      status: 'checking',
      detail: 'Comprobando /api/health',
    },
    {
      label: 'Frames',
      status: 'checking',
      detail: 'Comprobando OpenCV y Numpy',
    },
    {
      label: 'MediaPipe',
      status: 'checking',
      detail: 'Comprobando detector facial',
    },
  ]);

  constructor(private apiService: ApiService) {
    this.loadHealthChecks();
  }

  private async loadHealthChecks() {
    const [backend, frame, mediapipe] = await Promise.all([
      this.getBackendStatus(),
      this.getFrameStatus(),
      this.getMediapipeStatus(),
    ]);

    this.healthChecks.set([backend, frame, mediapipe]);
  }

  private async getBackendStatus(): Promise<HealthCheck> {
    try {
      const status = await this.apiService.getHealth();
      return {
        label: 'Backend',
        status: status.status === 'ok' ? 'ok' : 'error',
        detail: status.message ?? 'Backend disponible',
      };
    } catch {
      return {
        label: 'Backend',
        status: 'error',
        detail: 'No se pudo contactar con /api/health',
      };
    }
  }

  private async getFrameStatus(): Promise<HealthCheck> {
    try {
      const status = await this.apiService.getFrameHealth();
      return {
        label: 'Frames',
        status: status.opencv_loaded && status.numpy_loaded ? 'ok' : 'error',
        detail: `OpenCV ${status.opencv_version ?? 'no disponible'} · Numpy ${status.numpy_version ?? 'no disponible'}`,
      };
    } catch {
      return {
        label: 'Frames',
        status: 'error',
        detail: 'No se pudo contactar con /api/health/frame',
      };
    }
  }

  private async getMediapipeStatus(): Promise<HealthCheck> {
    try {
      const status = await this.apiService.getMediapipeHealth();
      return {
        label: 'MediaPipe',
        status: status.mediapipe_loaded ? 'ok' : 'error',
        detail: status.mediapipe_loaded ? 'Detector facial cargado' : 'Detector facial no disponible',
      };
    } catch {
      return {
        label: 'MediaPipe',
        status: 'error',
        detail: 'No se pudo contactar con /api/health/mediapipe',
      };
    }
  }
}

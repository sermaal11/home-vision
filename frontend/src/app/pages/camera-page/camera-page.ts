import { Component } from '@angular/core';
import { CameraComponent } from '../../components/camera/camera';

@Component({
  selector: 'app-camera-page',
  standalone: true,
  imports: [CameraComponent],
  templateUrl: './camera-page.html',
})
export class CameraPage {}

import { Component } from '@angular/core';
import { MotionDetectionComponent } from '../../components/motion-detection/motion-detection';

@Component({
  selector: 'app-motion-detection-page',
  standalone: true,
  imports: [MotionDetectionComponent],
  templateUrl: './motion-detection-page.html',
})
export class MotionDetectionPage {}

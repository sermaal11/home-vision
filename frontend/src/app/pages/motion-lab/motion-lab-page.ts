import { Component } from '@angular/core';
import { MotionLabComponent } from '../../components/motion-lab/motion-lab';

@Component({
  selector: 'app-motion-lab-page',
  standalone: true,
  imports: [MotionLabComponent],
  templateUrl: './motion-lab-page.html',
})
export class MotionLabPage {}

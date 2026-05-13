import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home';
import { FaceDetectionPage } from './pages/face-detection/face-detection-page';
import { MotionLabPage } from './pages/motion-lab/motion-lab-page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
    title: 'Home Vision',
  },
  {
    path: 'motion-lab',
    component: MotionLabPage,
    title: 'Home Vision | Motion Lab',
  },
  {
    path: 'face-detection',
    component: FaceDetectionPage,
    title: 'Home Vision | Face Detection',
  },
  {
    path: '**',
    redirectTo: '',
  },
];

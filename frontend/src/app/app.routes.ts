import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home';
import { FaceDetectionPage } from './pages/face-detection/face-detection-page';
import { HandDetectionPage } from './pages/hand-detection/hand-detection-page';
import { MotionLabPage } from './pages/motion-lab/motion-lab-page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
    title: 'Home Vision',
  },
  {
    path: 'motion-detection',
    component: MotionLabPage,
    title: 'Home Vision | Motion Detection',
  },
  {
    path: 'motion-lab',
    redirectTo: 'motion-detection',
  },
  {
    path: 'face-detection',
    component: FaceDetectionPage,
    title: 'Home Vision | Face Detection',
  },
  {
    path: 'hand-detection',
    component: HandDetectionPage,
    title: 'Home Vision | Hand Detection',
  },
  {
    path: '**',
    redirectTo: '',
  },
];

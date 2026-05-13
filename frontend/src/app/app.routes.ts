import { Routes } from '@angular/router';
import { CameraPage } from './pages/camera-page/camera-page';
import { HomePage } from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
    title: 'Home Vision',
  },
  {
    path: 'vision',
    component: CameraPage,
    title: 'Home Vision | Vision',
  },
  {
    path: '**',
    redirectTo: '',
  },
];

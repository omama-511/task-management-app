import { Routes } from '@angular/router';

export const routes: Routes = [
  // Default redirect to login
  { path: '', redirectTo: 'tasks', pathMatch: 'full' },

  // Auth module (lazy-loaded)
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },

  // Redirect short paths to auth module
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },

  // Tasks module (lazy-loaded, protected by AuthGuard inside TasksModule)
  {
    path: 'tasks',
    loadChildren: () => import('./tasks/tasks.module').then(m => m.TasksModule)
  },

  // Wildcard redirect
  { path: '**', redirectTo: 'auth/login' }
];
import { RenderMode, ServerRoute } from '@angular/ssr';

export const ServerRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];

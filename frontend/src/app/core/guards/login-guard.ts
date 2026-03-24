import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class loginGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) { }

  canActivate(): boolean {
    if (this.auth.isAuthenticated) {
      this.router.navigate(['/tasks']); // redirect if already logged in
      return false;
    }
    return true;
  }
}
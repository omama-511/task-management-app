import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject: BehaviorSubject<any>;
  public user$: Observable<any>;

  public get currentUserValue(): any {
    return this.userSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.userSubject.value?.token;
  }

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    let initialUser = null;
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const name = localStorage.getItem('userName');
      const email = localStorage.getItem('userEmail');
      if (token) {
        initialUser = { token, name, email };
      }
    }
    this.userSubject = new BehaviorSubject<any>(initialUser);
    this.user$ = this.userSubject.asObservable();

    if (initialUser && (!initialUser.name || !initialUser.email)) {
      this.getProfile();
    }
  }

  login(email: string, password: string): Observable<any> {
    console.log(`Attempting login for: ${email}`);
    return this.http.post(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap({
          next: (response: any) => {
            console.log('Login successful for:', response.email);
            localStorage.setItem('token', response.token);
            localStorage.setItem('userName', response.name);
            localStorage.setItem('userEmail', response.email);
            this.userSubject.next({ token: response.token, name: response.name, email: response.email });
          },
          error: (err) => {
            console.error('Login Request Failed', err);
          }
        })
      );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    this.userSubject.next(null);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/me/password`, {
      current_password: currentPassword,
      new_password: newPassword
    });
  }

  getProfile(): void {
    const token = localStorage.getItem('token');
    if (token && isPlatformBrowser(this.platformId)) {
      this.http.get(`${this.apiUrl}/users/me`).subscribe({
        next: (res: any) => {
          localStorage.setItem('userName', res.name);
          localStorage.setItem('userEmail', res.email);
          this.userSubject.next({ token, name: res.name, email: res.email });
        },
        error: () => {
          this.logout();
        }
      });
    }
  }

  updateProfile(name: string, email: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/me`, { name, email }).pipe(
      tap((res: any) => {
        const currentToken = this.currentUserValue?.token;
        localStorage.setItem('userName', res.name);
        localStorage.setItem('userEmail', res.email);
        this.userSubject.next({ token: currentToken, name: res.name, email: res.email });
      })
    );
  }
}
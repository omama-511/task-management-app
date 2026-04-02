import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AuthUser {
  token: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password?: string;
}

export interface ProfileResponse {
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject: BehaviorSubject<AuthUser | null>;
  public user$: Observable<AuthUser | null>;

  public get currentUserValue(): AuthUser | null {
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
        initialUser = { token, name: name || '', email: email || '' };
      } else {
        console.debug('No token found in localStorage');
      }
    } else {
      console.debug('Not running in browser context');
    }
    this.userSubject = new BehaviorSubject<AuthUser | null>(initialUser);
    this.user$ = this.userSubject.asObservable();

    if (initialUser && (!initialUser.name || !initialUser.email)) {
      this.getProfile();
    } else {
      console.debug('Auth initialized with user or no user to fetch profile for');
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    console.log(`Attempting login for: ${email}`);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap({
          next: (response: AuthResponse) => {
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

  register(userData: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    this.userSubject.next(null);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/users/me/password`, {
      current_password: currentPassword,
      new_password: newPassword
    });
  }

  getProfile(): void {
    const token = localStorage.getItem('token');
    if (token && isPlatformBrowser(this.platformId)) {
      this.http.get<ProfileResponse>(`${this.apiUrl}/users/me`).subscribe({
        next: (res: ProfileResponse) => {
          localStorage.setItem('userName', res.name);
          localStorage.setItem('userEmail', res.email);
          this.userSubject.next({ token, name: res.name, email: res.email });
        },
        error: () => {
          this.logout();
        }
      });
    } else {
      console.debug('Skip getProfile: missing token or not browser');
    }
  }

  updateProfile(name: string, email: string): Observable<ProfileResponse> {
    return this.http.put<ProfileResponse>(`${this.apiUrl}/users/me`, { name, email }).pipe(
      tap((res: ProfileResponse) => {
        const currentToken = this.currentUserValue?.token || '';
        localStorage.setItem('userName', res.name);
        localStorage.setItem('userEmail', res.email);
        this.userSubject.next({ token: currentToken, name: res.name, email: res.email });
      })
    );
  }
}
/** @vitest-environment jsdom */
import { Login } from './login';
import { of, throwError } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FormBuilder } from '@angular/forms';

describe('Login (Unit Test)', () => {
  let component: Login;
  let authServiceMock: { login: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  const fb = new FormBuilder();

  beforeEach(() => {
    authServiceMock = {
      login: vi.fn().mockReturnValue(of({}))
    };
    routerMock = {
      navigate: vi.fn()
    };
    component = new Login(
      fb, 
      authServiceMock as unknown as import('../../core/services/auth.service').AuthService, 
      routerMock as unknown as import('@angular/router').Router
    );
  });

  it('should validate form fields', () => {
    expect(component.loginForm.valid).toBe(false);
    component.loginForm.patchValue({ email: 'test@example.com', password: 'password123' });
    expect(component.loginForm.valid).toBe(true);
  });

  it('should login successfully', () => {
    component.loginForm.patchValue({ email: 'test@example.com', password: 'password123' });
    component.submit();

    expect(authServiceMock.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('should handle login error (status 0)', () => {
    authServiceMock.login.mockReturnValue(throwError(() => ({ status: 0 })));
    component.loginForm.patchValue({ email: 'test@example.com', password: 'password123' });
    component.submit();

    expect(component.errorMessage).toContain('backend server');
  });

  it('should handle login error with detail', () => {
    const errorResponse = { status: 401, error: { detail: 'Invalid credentials' } };
    authServiceMock.login.mockReturnValue(throwError(() => errorResponse));
    component.loginForm.patchValue({ email: 'test@example.com', password: 'password123' });
    component.submit();

    expect(component.errorMessage).toBe('Invalid credentials');
  });

  it('should handle generic login error', () => {
    authServiceMock.login.mockReturnValue(throwError(() => ({ status: 500, message: 'Server error' })));
    component.loginForm.patchValue({ email: 'test@example.com', password: 'password123' });
    component.submit();

    expect(component.errorMessage).toContain('Server error');
  });

  it('should not submit if form is invalid', () => {
    component.submit();
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('should call ngOnInit', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('should handle generic login error without message fallback', () => {
    authServiceMock.login.mockReturnValue(throwError(() => ({ status: 500 })));
    component.loginForm.patchValue({ email: 'test@example.com', password: 'password123' });
    component.submit();

    expect(component.errorMessage).toContain('Login failed');
  });
});

/** @vitest-environment jsdom */
import { Register } from './register';
import { of, throwError } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FormBuilder } from '@angular/forms';

describe('Register (Unit Test)', () => {
  let component: Register;
  let authServiceMock: { register: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  const fb = new FormBuilder();

  beforeEach(() => {
    authServiceMock = {
      register: vi.fn().mockReturnValue(of({}))
    };
    routerMock = {
      navigate: vi.fn()
    };
    component = new Register(
      fb, 
      authServiceMock as unknown as import('../../core/services/auth.service').AuthService, 
      routerMock as unknown as import('@angular/router').Router
    );
  });

  it('should validate form', () => {
    expect(component.registerForm.valid).toBe(false);
    component.registerForm.patchValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });
    expect(component.registerForm.valid).toBe(true);
  });

  it('should register successfully', () => {
    component.registerForm.patchValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });
    component.submit();

    expect(authServiceMock.register).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should show error if passwords do not match', () => {
    component.registerForm.patchValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'different'
    });
    component.submit();

    expect(component.errorMessage).toBe('Passwords do not match');
    expect(authServiceMock.register).not.toHaveBeenCalled();
  });

  it('should handle registration error', () => {
    const errorResponse = { error: { detail: 'Email already exists' } };
    authServiceMock.register.mockReturnValue(throwError(() => errorResponse));
    component.registerForm.patchValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });
    component.submit();

    expect(component.errorMessage).toBe('Email already exists');
  });

  it('should handle generic registration error', () => {
    authServiceMock.register.mockReturnValue(throwError(() => ({})));
    component.registerForm.patchValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });
    component.submit();

    expect(component.errorMessage).toBe('Registration failed');
  });

  it('should not submit if form is invalid', () => {
    component.submit();
    expect(authServiceMock.register).not.toHaveBeenCalled();
  });
});

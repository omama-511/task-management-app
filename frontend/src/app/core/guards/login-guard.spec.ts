
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { loginGuard } from './login-guard';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('loginGuard', () => {
    let guard: loginGuard;
    let authService: { isAuthenticated: boolean };
    let router: { navigate: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        authService = { isAuthenticated: false };
        router = { navigate: vi.fn() };
        guard = new loginGuard(authService as unknown as import('../services/auth.service').AuthService, router as unknown as import('@angular/router').Router);
    });

    it('should be created', () => {
        expect(guard).toBeTruthy();
    });

    it('should return true if user is not authenticated', () => {
        authService.isAuthenticated = false;
        const result = guard.canActivate();
        expect(result).toBe(true);
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should redirect to /tasks and return false if user is authenticated', () => {
        authService.isAuthenticated = true;
        const result = guard.canActivate();
        expect(result).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    });
});

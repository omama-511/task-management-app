/** @vitest-environment jsdom */
import { Navbar } from './navbar';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';

describe('Navbar (Unit Test)', () => {
  let component: Navbar;
  let authServiceMock: { logout: ReturnType<typeof vi.fn>; isAuthenticated: boolean };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let themeServiceMock: { toggleTheme: ReturnType<typeof vi.fn>; isDarkTheme$: import('rxjs').Observable<boolean> };

  beforeEach(() => {
    authServiceMock = {
      logout: vi.fn(),
      isAuthenticated: true
    };
    routerMock = {
      navigate: vi.fn()
    };
    themeServiceMock = {
      toggleTheme: vi.fn(),
      isDarkTheme$: of(false)
    };
    component = new Navbar(authServiceMock as unknown as import('../../../core/services/auth.service').AuthService, routerMock as unknown as import('@angular/router').Router, themeServiceMock as unknown as import('../../../core/services/theme.service').ThemeService);
  });

  it('should logout and navigate', () => {
    component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should toggle theme', () => {
    component.toggleTheme();
    expect(themeServiceMock.toggleTheme).toHaveBeenCalled();
  });
});

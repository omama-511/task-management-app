/** @vitest-environment jsdom */
import { App } from './app';
import { of } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('App (Unit Test)', () => {
  let component: App;
  let authServiceMock: { user$: import('rxjs').Observable<unknown>; isAuthenticated: boolean; currentUserValue: unknown };
  let dialogMock: { open: ReturnType<typeof vi.fn> };
  let themeServiceMock: { toggleTheme: ReturnType<typeof vi.fn>; isDarkTheme$: import('rxjs').Observable<boolean>; };

  beforeEach(() => {
    authServiceMock = {
      isAuthenticated: true,
      currentUserValue: { name: 'Test User', email: 'test@example.com' },
      user$: of({ name: 'Test User', email: 'test@example.com' })
    };
    dialogMock = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of(true) })
    };
    themeServiceMock = {
      toggleTheme: vi.fn(),
      isDarkTheme$: of(false)
    };
    component = new App(
      authServiceMock as unknown as import('./core/services/auth.service').AuthService, 
      dialogMock as unknown as import('@angular/material/dialog').MatDialog, 
      themeServiceMock as unknown as import('./core/services/theme.service').ThemeService
    );
  });

  it('should initialize with title', () => {
    expect(component.title()).toBe('Task Management App');
  });

  it('should open change password dialog', () => {
    component.openChangePassword();
    expect(dialogMock.open).toHaveBeenCalled();
  });

  it('should open edit profile dialog with user data', () => {
    component.openEditProfile();
    expect(dialogMock.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      data: { name: 'Test User', email: 'test@example.com' }
    }));
  });

  it('should not open edit profile dialog if user is missing', () => {
    authServiceMock.currentUserValue = null;
    dialogMock.open.mockClear(); // clean up if needed just in case
    component.openEditProfile();
    expect(dialogMock.open).not.toHaveBeenCalled();
  });
});

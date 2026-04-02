/** @vitest-environment jsdom */
import { AuthService } from './auth.service';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MOCK_USER, MOCK_PROFILE, MOCK_UPDATED_USER } from './mock-data.spec';

describe('AuthService (Unit Test)', () => {
  let service: AuthService;
  let httpMock: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let store: Record<string, string> = {};  //fake local storage

  beforeEach(() => {
    store = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value.toString(); }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
      clear: vi.fn(() => { store = {}; })
    });

    httpMock = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };

    // Instantiate manually to avoid TestBed issues with Vitest/Angular
    service = new AuthService(httpMock as unknown as import('@angular/common/http').HttpClient, 'browser');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
 
  it('should initialize with user if token exists in localStorage', () => {
    store['token'] = 'existing-token';
    store['userName'] = 'John';
    store['userEmail'] = 'john@example.com';
    const newService = new AuthService(httpMock as unknown as import('@angular/common/http').HttpClient, 'browser');
    expect(newService.currentUserValue).toEqual({
      token: 'existing-token',
      name: 'John',
      email: 'john@example.com'
    });
  });

  it('should trigger getProfile on init if token exists but name/email missing', () => {
    store['token'] = 'token-only';
    httpMock.get.mockReturnValue(of(MOCK_PROFILE));
    const newService = new AuthService(httpMock as unknown as import('@angular/common/http').HttpClient, 'browser');
    expect(httpMock.get).toHaveBeenCalledWith(expect.stringContaining('/users/me'));
  });

  it('should initialize with null if not on browser platform', () => {
    const serverService = new AuthService(httpMock as unknown as import('@angular/common/http').HttpClient, 'server');
    expect(serverService.currentUserValue).toBeNull();
  });

  it('should log debug when no token in localStorage during init', () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    new AuthService(httpMock as unknown as import('@angular/common/http').HttpClient, 'browser');
    expect(consoleSpy).toHaveBeenCalledWith('No token found in localStorage');
  });

  it('should not call getProfile if user is already full on init', () => {
    store['token'] = 'token';
    store['userName'] = 'Name';
    store['userEmail'] = 'email';
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    new AuthService(httpMock as unknown as import('@angular/common/http').HttpClient, 'browser');
    expect(consoleSpy).toHaveBeenCalledWith('Auth initialized with user or no user to fetch profile for');
    expect(httpMock.get).not.toHaveBeenCalled();
  });

  it('should have initial null user if no token in localStorage', () => {
    expect(service.currentUserValue).toBeNull();
    expect(service.isAuthenticated).toBe(false);
  });

  it('should attempt login and store token/user details on success', () => {
    httpMock.post.mockReturnValue(of(MOCK_USER));

    service.login(MOCK_USER.email, 'password').subscribe(user => {
      expect(user).toEqual(MOCK_USER);
      expect(localStorage.setItem).toHaveBeenCalledWith('token', MOCK_USER.token);
      expect(service.currentUserValue).toEqual(MOCK_USER);
    });

    expect(httpMock.post).toHaveBeenCalledWith(expect.stringContaining('/login'), {
      email: MOCK_USER.email,
      password: 'password'
    });
  });

  it('should log error on login failure', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    httpMock.post.mockReturnValue(throwError(() => new Error('Login failed')));
    
    service.login('test@example.com', 'password').subscribe({
      error: () => {
        expect(consoleSpy).toHaveBeenCalledWith('Login Request Failed', expect.any(Error));
      }
    });
  });

  it('should handle registration', () => {
    const userData = { email: 'new@example.com', password: 'password', name: 'New User' };
    const mockResponse = { message: 'Success' };
    httpMock.post.mockReturnValue(of(mockResponse));

    service.register(userData).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    expect(httpMock.post).toHaveBeenCalledWith(expect.stringContaining('/register'), userData);
  });

  it('should clear localStorage and user state on logout', () => {
    store['token'] = 'some-token';
    localStorage.setItem('user', JSON.stringify({ token: 'test-token', name: 'Server Name', email: 'server@email.com' }));

    service.logout();

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('userName');
    expect(localStorage.removeItem).toHaveBeenCalledWith('userEmail');
    expect(service.currentUserValue).toBeNull();
  });

  it('should update profile and storage', () => {
    service['userSubject'].next({ token: 'existing-token', name: 'Old', email: 'old@example.com' });
    httpMock.put.mockReturnValue(of(MOCK_UPDATED_USER));

    service.updateProfile(MOCK_UPDATED_USER.name, MOCK_UPDATED_USER.email).subscribe(res => {
      expect(res).toEqual(MOCK_UPDATED_USER);
      expect(localStorage.setItem).toHaveBeenCalledWith('userName', MOCK_UPDATED_USER.name);
      expect(localStorage.setItem).toHaveBeenCalledWith('userEmail', MOCK_UPDATED_USER.email);
      expect(service.currentUserValue?.name).toBe(MOCK_UPDATED_USER.name);
    });
  });

  it('should update profile and handle fallback token gracefully when no user is logged in', () => {
    service['userSubject'].next(null);
    httpMock.put.mockReturnValue(of(MOCK_UPDATED_USER));

    service.updateProfile(MOCK_UPDATED_USER.name, MOCK_UPDATED_USER.email).subscribe(res => {
      expect(res).toEqual(MOCK_UPDATED_USER);
      expect(service.currentUserValue?.token).toBe('');
      expect(service.currentUserValue?.name).toBe(MOCK_UPDATED_USER.name);
    });
  });

  it('should fetch profile and update state', () => {
    store['token'] = 'valid-token';
    httpMock.get.mockReturnValue(of(MOCK_PROFILE));

    service.getProfile();

    expect(httpMock.get).toHaveBeenCalledWith(expect.stringContaining('/users/me'));
    expect(service.currentUserValue).toEqual({
      token: 'valid-token',
      name: MOCK_PROFILE.name,
      email: MOCK_PROFILE.email
    });
  });

  it('should logout on profile fetch error', () => {
    store['token'] = 'invalid-token';
    httpMock.get.mockReturnValue(throwError(() => new Error('Unauthorized')));
    vi.spyOn(service, 'logout');

    service.getProfile();

    expect(service.logout).toHaveBeenCalled();
  });

  it('should skip getProfile if missing token', () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    store['token'] = '';
    service.getProfile();
    expect(consoleSpy).toHaveBeenCalledWith('Skip getProfile: missing token or not browser');
    expect(httpMock.get).not.toHaveBeenCalled();
  });

  it('should skip getProfile if not on browser platform', () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const serverService = new AuthService(httpMock as unknown as import('@angular/common/http').HttpClient, 'server');
    serverService.getProfile();
    expect(consoleSpy).toHaveBeenCalledWith('Skip getProfile: missing token or not browser');
  });

  it('should change password', () => {
    httpMock.put.mockReturnValue(of({}));
    service.changePassword('old', 'new').subscribe();

    expect(httpMock.put).toHaveBeenCalledWith(expect.stringContaining('/users/me/password'), {
      current_password: 'old',
      new_password: 'new'
    });
  });
});

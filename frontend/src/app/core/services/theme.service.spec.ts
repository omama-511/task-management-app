/** @vitest-environment jsdom */
import { ThemeService } from './theme.service';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ThemeService (Unit Test)', () => {
  let service: ThemeService;
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value.toString(); }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
    });

    // Mock matchMedia
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.removeAttribute('data-theme');
  });

  it('should be created', () => {
    service = new ThemeService('browser');
    expect(service).toBeTruthy();
  });

  it('should initialize with light theme by default (no preference)', () => {
    service = new ThemeService('browser');
    let currentTheme: boolean | undefined;
    service.isDarkTheme$.subscribe(isDark => currentTheme = isDark);
    expect(currentTheme).toBe(false);
    expect(document.body.getAttribute('data-theme')).toBeNull();
  });

  it('should initialize with dark theme from localStorage', () => {
    store['theme'] = 'dark';
    service = new ThemeService('browser');
    let currentTheme: boolean | undefined;
    service.isDarkTheme$.subscribe(isDark => currentTheme = isDark);
    expect(currentTheme).toBe(true);
    expect(document.body.getAttribute('data-theme')).toBe('dark');
  });

  it('should initialize with light theme from localStorage', () => {
    store['theme'] = 'light';
    service = new ThemeService('browser');
    let currentTheme: boolean | undefined;
    service.isDarkTheme$.subscribe(isDark => currentTheme = isDark);
    expect(currentTheme).toBe(false);
    expect(document.body.getAttribute('data-theme')).toBeNull();
  });

  it('should initialize with dark theme from system preference', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
    })));

    service = new ThemeService('browser');
    let currentTheme: boolean | undefined;
    service.isDarkTheme$.subscribe(isDark => currentTheme = isDark);
    expect(currentTheme).toBe(true);
    expect(document.body.getAttribute('data-theme')).toBe('dark');
  });

  it('should toggle theme', () => {
    service = new ThemeService('browser');
    service.toggleTheme();

    let currentTheme: boolean | undefined;
    service.isDarkTheme$.subscribe(isDark => currentTheme = isDark);

    expect(currentTheme).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    expect(document.body.getAttribute('data-theme')).toBe('dark');

    service.toggleTheme();
    expect(currentTheme).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    expect(document.body.getAttribute('data-theme')).toBeNull();
  });

  it('should set theme explicitly', () => {
    service = new ThemeService('browser');
    service.setDarkTheme(true);
    expect(document.body.getAttribute('data-theme')).toBe('dark');

    service.setDarkTheme(false);
    expect(document.body.getAttribute('data-theme')).toBeNull();
  });

  it('should log debug when initialized on non-browser platform', () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => { });
    new ThemeService('server');
    expect(consoleSpy).toHaveBeenCalledWith('ThemeService initialized on non-browser platform');
  });

  it('should skip side effects in setDarkTheme on non-browser platform', () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => { });
    const serverService = new ThemeService('server');
    serverService.setDarkTheme(true);
    expect(consoleSpy).toHaveBeenCalledWith('setDarkTheme: Not on browser platform, skipping side effects');
    expect(document.body.getAttribute('data-theme')).toBeNull();
  });
});

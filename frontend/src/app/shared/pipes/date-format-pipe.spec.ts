import { DateFormatPipe } from './date-format-pipe';

describe('DateFormatPipe', () => {
  let pipe: DateFormatPipe;

  beforeEach(() => {
    pipe = new DateFormatPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string if value is false', () => {
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform(null as unknown as string)).toBe('');
    expect(pipe.transform(undefined as unknown as string)).toBe('');
  });

  it('should format date with default format (mediumDate)', () => {
    const date = new Date('2023-01-01T12:00:00Z');
    // Depending on timezone, mediumDate output can slightly vary.
    // 'Jan 1, 2023' or similar. We check that it at least includes 2023.
    expect(pipe.transform(date)).toContain('2023');
  });

  it('should format date with custom format', () => {
    const date = new Date('2023-01-01T12:00:00Z');
    expect(pipe.transform(date, 'yyyy')).toBe('2023');
  });
});

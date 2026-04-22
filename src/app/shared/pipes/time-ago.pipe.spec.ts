import { describe, it, expect, vi, afterEach } from 'vitest';
import { TimeAgoPipe } from './time-ago.pipe';

describe('TimeAgoPipe', () => {
  const pipe = new TimeAgoPipe();
  const now = new Date('2024-06-15T12:00:00Z').getTime();

  beforeEach(() => {
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('returns "just now" for very recent timestamps', () => {
    const recent = new Date(now - 30000).toISOString();
    expect(pipe.transform(recent)).toBe('just now');
  });

  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(now - 5 * 60000).toISOString();
    expect(pipe.transform(fiveMinAgo)).toBe('5m ago');
  });

  it('returns hours ago', () => {
    const threeHoursAgo = new Date(now - 3 * 3600000).toISOString();
    expect(pipe.transform(threeHoursAgo)).toBe('3h ago');
  });

  it('returns days ago', () => {
    const twoDaysAgo = new Date(now - 2 * 86400000).toISOString();
    expect(pipe.transform(twoDaysAgo)).toBe('2d ago');
  });

  it('returns months ago', () => {
    const twoMonthsAgo = new Date(now - 62 * 86400000).toISOString();
    expect(pipe.transform(twoMonthsAgo)).toBe('2mo ago');
  });
});

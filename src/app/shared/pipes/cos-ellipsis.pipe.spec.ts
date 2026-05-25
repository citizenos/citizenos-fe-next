import { describe, it, expect } from 'vitest';
import { CosEllipsisPipe } from './cos-ellipsis.pipe';

describe('CosEllipsisPipe', () => {
  it('should create an instance', () => {
    const pipe = new CosEllipsisPipe();
    expect(pipe).toBeTruthy();
  });

  describe('transform behavior', () => {
    const pipe = new CosEllipsisPipe();

    it('should return empty string for null, undefined, or non-string values', () => {
      expect(pipe.transform(null)).toBe('');
      expect(pipe.transform(undefined)).toBe('');
      expect(pipe.transform(123 as any)).toBe('');
    });

    it('should truncate string to default 128 characters if no limit is specified', () => {
      const longString = 'a'.repeat(200);
      expect(pipe.transform(longString)).toBe('a'.repeat(128) + '...');
    });

    it('should truncate string to custom limit', () => {
      const text = 'Hello world, this is a test';
      expect(pipe.transform(text, 10)).toBe('Hello worl...');
    });

    it('should not append ellipsis if string length is less than or equal to limit', () => {
      const text = 'Hello';
      expect(pipe.transform(text, 10)).toBe('Hello');
      expect(pipe.transform(text, 5)).toBe('Hello');
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { IconRegistryService } from './icon.registry';
import { describe, it, expect, beforeEach } from 'vitest';

describe('IconRegistryService', () => {
  let service: IconRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IconRegistryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return icon data for valid icon name', async () => {
    await new Promise<void>(resolve => {
      service.isLoaded.subscribe(loaded => {
        if (loaded) resolve();
      });
    });
    const icon = service.getIcon('smart-id');
    expect(icon).toBeDefined();
    expect(icon?.viewBox).toBe('0 0 48 48');
    expect(icon?.content).toContain('<path');
  });

  it('should return undefined for invalid icon name', () => {
    const icon = service.getIcon('non-existent' as never);
    expect(icon).toBeUndefined();
  });

  it('should have official e-id icons registered', async () => {
    await new Promise<void>(resolve => {
      service.isLoaded.subscribe(loaded => {
        if (loaded) resolve();
      });
    });
    expect(service.getIcon('smart-id')).toBeDefined();
    expect(service.getIcon('mobile-id')).toBeDefined();
    expect(service.getIcon('id-card')).toBeDefined();
  });
});

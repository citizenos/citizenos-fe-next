import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect } from 'vitest';
import { routes } from './app.routes';

describe('app.routes redirect', () => {
  it('preserves queryParams when redirecting legacy paths', async () => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter(routes)
      ]
    });
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/topics/t1/ideation/i1/ideas/id1/reports/r1/moderate?token=testtoken');
    expect(router.url).toBe('/en/topics/t1/ideation/i1/ideas/id1/reports/r1/moderate?token=testtoken');
  });
});

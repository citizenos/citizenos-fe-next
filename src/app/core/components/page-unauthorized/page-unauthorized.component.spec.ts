import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PageUnauthorizedComponent } from './page-unauthorized.component';
import { provideRouter } from '@angular/router';

function setup() {
  TestBed.configureTestingModule({
    imports: [PageUnauthorizedComponent],
    providers: [provideRouter([])],
  }).compileComponents();

  const fixture = TestBed.createComponent(PageUnauthorizedComponent);
  fixture.detectChanges();
  return { fixture };
}

describe('PageUnauthorizedComponent', () => {
  it('renders without error', () => {
    const { fixture } = setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the unauthorized container element', () => {
    const { fixture } = setup();
    const el = fixture.nativeElement.querySelector('.page_unauthorized');
    expect(el).toBeTruthy();
  });

  it('renders a link back to dashboard', () => {
    const { fixture } = setup();
    const link = fixture.nativeElement.querySelector('a[href="/dashboard"]');
    expect(link).toBeTruthy();
  });
});

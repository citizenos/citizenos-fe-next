import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TermsLinksComponent } from './terms-links.component';
import { TranslateModule } from '@ngx-translate/core';
import { Component } from '@angular/core';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent {}

describe('TermsLinksComponent', () => {
  let fixture: ComponentFixture<TermsLinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsLinksComponent, TranslateModule.forRoot()]
    })
    .overrideComponent(TermsLinksComponent, {
      set: { imports: [TranslateModule, MockIconComponent] }
    })
    .compileComponents();
    fixture = TestBed.createComponent(TermsLinksComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render three links', () => {
    const el: HTMLElement = fixture.nativeElement;
    const links = el.querySelectorAll('a.link');
    expect(links.length).toBe(3);
  });

  it('should open links in new tab', () => {
    const el: HTMLElement = fixture.nativeElement;
    const links = el.querySelectorAll<HTMLAnchorElement>('a.link');
    links.forEach(link => expect(link.target).toBe('_blank'));
  });
});

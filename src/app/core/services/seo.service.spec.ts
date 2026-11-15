import { TestBed } from '@angular/core/testing';
import { Title, Meta } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { SeoService } from './seo.service';
import { SUPPORTED_LANGUAGES } from '../resolvers/language.resolver';

describe('SeoService', () => {
  let service: SeoService;
  let titleService: Title;
  let metaService: Meta;
  let translate: TranslateService;
  let routerEvents$: Subject<Event>;
  let doc: Document;

  beforeEach(() => {
    routerEvents$ = new Subject();

    const mockRouter = {
      events: routerEvents$.asObservable(),
      url: '/en/dashboard'
    };

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        SeoService,
        { provide: Router, useValue: mockRouter }
      ]
    });

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      META_DEFAULT_TITLE: 'Citizen OS - a free participation platform for civil society.',
      META_DEFAULT_DESCRIPTION: 'Citizen OS helps you gather ideas, discuss, vote, and make decisions together.',
      META_DEFAULT_KEYWORDS: 'e-decisionmaking, e-governance, e-democracy',
    });
    translate.setTranslation('et', {
      META_DEFAULT_TITLE: 'Citizen OS - tasuta osalusplatvorm kodanikuühiskonna jaoks.',
      META_DEFAULT_DESCRIPTION: 'Citizen OS aitab koguda ideid, arutada, hääletada ja teha ühiselt otsuseid.',
      META_DEFAULT_KEYWORDS: 'kaasamine, e-otsustamine, e-valitsemine',
    });
    translate.use('en');

    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
    doc = TestBed.inject(DOCUMENT);
    service = TestBed.inject(SeoService);
  });

  it('should initialize with default page title and Open Graph / meta tags', () => {
    expect(titleService.getTitle()).toBe('Citizen OS - a free participation platform for civil society.');
    expect(metaService.getTag('property="og:title"')?.content).toBe('Citizen OS - a free participation platform for civil society.');
    expect(metaService.getTag('name="description"')?.content).toBe('Citizen OS helps you gather ideas, discuss, vote, and make decisions together.');
    expect(metaService.getTag('name="keywords"')?.content).toBe('e-decisionmaking, e-governance, e-democracy');
    expect(metaService.getTag('property="og:site_name"')?.content).toBe('CitizenOS.com');
    expect(metaService.getTag('property="og:image"')?.content).toContain('/assets/imgs/logo_dark_seo.jpg');
  });

  it('should set custom page title and update og:title tag', () => {
    service.setPageTitle('My Test Topic');
    expect(titleService.getTitle()).toBe('My Test Topic');
    expect(metaService.getTag('property="og:title"')?.content).toBe('My Test Topic');
  });

  it('should reset to default page title when called without argument', () => {
    service.setPageTitle('Custom Title');
    expect(titleService.getTitle()).toBe('Custom Title');

    service.setPageTitle();
    expect(titleService.getTitle()).toBe('Citizen OS - a free participation platform for civil society.');
    expect(metaService.getTag('property="og:title"')?.content).toBe('Citizen OS - a free participation platform for civil society.');
  });

  it('should update title and meta tags when language changes', () => {
    translate.use('et');
    expect(titleService.getTitle()).toBe('Citizen OS - tasuta osalusplatvorm kodanikuühiskonna jaoks.');
    expect(metaService.getTag('property="og:title"')?.content).toBe('Citizen OS - tasuta osalusplatvorm kodanikuühiskonna jaoks.');
    expect(metaService.getTag('name="description"')?.content).toBe('Citizen OS aitab koguda ideid, arutada, hääletada ja teha ühiselt otsuseid.');
    expect(metaService.getTag('name="keywords"')?.content).toBe('kaasamine, e-otsustamine, e-valitsemine');
  });

  it('should preserve custom content title on language change if it is not an i18n key', () => {
    service.setPageTitle('Specific Topic Title');
    translate.use('et');
    expect(titleService.getTitle()).toBe('Specific Topic Title');
    expect(metaService.getTag('property="og:title"')?.content).toBe('Specific Topic Title');
  });

  it('should reset page title on NavigationEnd when route path changes', () => {
    service.setPageTitle('A Topic Title');
    expect(titleService.getTitle()).toBe('A Topic Title');

    // Simulate navigation to another page
    routerEvents$.next(new NavigationEnd(1, '/en/my/topics', '/en/my/topics'));
    expect(titleService.getTitle()).toBe('Citizen OS - a free participation platform for civil society.');
  });

  it('should not reset page title on NavigationEnd when only fragment changes', () => {
    routerEvents$.next(new NavigationEnd(1, '/en/topics/123', '/en/topics/123'));
    service.setPageTitle('A Topic Title');
    expect(titleService.getTitle()).toBe('A Topic Title');

    // Simulate clicking tab within the same topic (fragment only)
    routerEvents$.next(new NavigationEnd(2, '/en/topics/123#voting', '/en/topics/123#voting'));
    expect(titleService.getTitle()).toBe('A Topic Title');
  });

  it('should create and update hreflang alternate links for supported languages', () => {
    service.createRelUrls('/en/topics/123');

    SUPPORTED_LANGUAGES.forEach((lang) => {
      const link = doc.querySelector(`link[rel="alternate"][hreflang="${lang}"]`) as HTMLLinkElement;
      expect(link).toBeTruthy();
      expect(link.getAttribute('href')).toContain(`/${lang}/topics/123`);
    });
  });
});

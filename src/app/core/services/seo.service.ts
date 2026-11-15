import { Service, inject, PLATFORM_ID, DestroyRef } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';
import { DOCUMENT, Location, PlatformLocation, isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SUPPORTED_LANGUAGES } from '../resolvers/language.resolver';

@Service()
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private translate = inject(TranslateService);
  private router = inject(Router);
  private document = inject(DOCUMENT);
  private location = inject(Location);
  private platformLocation = inject(PlatformLocation);
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);

  private currentTitleKeyOrText = 'META_DEFAULT_TITLE';
  private currentDescriptionKey?: string;
  private currentKeywordsKey?: string;
  private previousPath = '';

  constructor() {
    this.init();
  }

  init() {
    this.translate.addLangs(SUPPORTED_LANGUAGES);
    this.previousPath = (this.router.url || '').split(/[?#]/)[0];
    this.setDefaultMetaInfo();

    // Listen to language changes so titles and descriptions update dynamically
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.applyTitle();
        this.updateMeta(this.currentDescriptionKey, this.currentKeywordsKey);
        this.createRelUrls();
        this.updateUrlMeta();
      });

    // Listen to navigation events to reset title on page transitions and update hreflang / og:url
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        const [currentPath] = (event.urlAfterRedirects || event.url).split(/[?#]/);
        if (this.previousPath !== currentPath) {
          this.previousPath = currentPath;
          // Reset page title on page change (matches legacy app.component.ts)
          this.setPageTitle();
        }
        this.createRelUrls(event.urlAfterRedirects || event.url);
        this.updateUrlMeta();
      });
  }

  setPageTitle(title?: string) {
    this.currentTitleKeyOrText = title || 'META_DEFAULT_TITLE';
    this.applyTitle();
  }

  private applyTitle() {
    const raw = this.currentTitleKeyOrText || 'META_DEFAULT_TITLE';
    const translated = this.translate.instant(raw);
    this.titleService.setTitle(translated);
    this.metaService.updateTag({
      property: 'og:title',
      content: translated
    });
  }

  setDefaultMetaInfo() {
    this.applyTitle();

    const description = this.translate.instant(this.currentDescriptionKey || 'META_DEFAULT_DESCRIPTION');
    const keywords = this.translate.instant(this.currentKeywordsKey || 'META_DEFAULT_KEYWORDS');
    const absoluteLogoUrl = this.getAbsoluteUrl('/assets/imgs/logo_dark_seo.jpg');

    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ name: 'keywords', content: keywords });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:image', content: absoluteLogoUrl });
    this.metaService.updateTag({ property: 'og:site_name', content: 'CitizenOS.com' });
    this.updateUrlMeta();
  }

  updateMeta(descriptionKey?: string, keywordsKey?: string) {
    this.currentDescriptionKey = descriptionKey;
    this.currentKeywordsKey = keywordsKey;

    const description = this.translate.instant(descriptionKey || 'META_DEFAULT_DESCRIPTION');
    const keywords = this.translate.instant(keywordsKey || 'META_DEFAULT_KEYWORDS');

    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ name: 'keywords', content: keywords });
  }

  updateUrlMeta() {
    this.metaService.updateTag({
      property: 'og:url',
      content: this.currentUrl()
    });
  }

  createRelUrls(url?: string) {
    const currentUrl = url || this.router.url;
    const langs = this.translate.getLangs().length ? this.translate.getLangs() : SUPPORTED_LANGUAGES;

    langs.forEach((language) => {
      const urlItem = currentUrl.split('/');
      if (urlItem.length > 1) {
        urlItem[1] = language;
      }
      const fullUrl = this.getAbsoluteUrl(urlItem.join('/'));

      let link: HTMLLinkElement | null = this.document.querySelector(`link[rel="alternate"][hreflang="${language}"]`);
      if (link) {
        link.setAttribute('href', fullUrl);
      } else {
        link = this.document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', language);
        this.document.head.appendChild(link);
      }
      link.setAttribute('href', fullUrl);
    });
  }

  getBaseUrl(): string {
    if (isPlatformBrowser(this.platformId) && window.location?.origin) {
      return window.location.origin;
    }
    let port = '';
    if (this.platformLocation.port && this.platformLocation.protocol === 'https:' && this.platformLocation.port !== '443') {
      port = `:${this.platformLocation.port}`;
    } else if (this.platformLocation.port && this.platformLocation.protocol === 'http:' && this.platformLocation.port !== '80') {
      port = `:${this.platformLocation.port}`;
    }
    if (port === ':') {
      port = '';
    }
    const protocol = this.platformLocation.protocol || 'https:';
    const hostname = this.platformLocation.hostname || 'app.citizenos.com';
    return `${protocol}//${hostname}${port}`;
  }

  getAbsoluteUrl(path: string): string {
    const baseUrl = this.getBaseUrl();
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  }

  currentUrl(): string {
    const baseUrl = this.getBaseUrl();
    return `${baseUrl}${this.location.path()}`;
  }
}

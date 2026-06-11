import { Service, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Service()
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private translate = inject(TranslateService);

  setPageTitle(titleKey?: string) {
    const translatedTitle = this.translate.instant(titleKey || 'META_DEFAULT_TITLE');
    this.titleService.setTitle(translatedTitle);
    this.metaService.updateTag({
      property: 'og:title',
      content: translatedTitle
    });
  }

  updateMeta(descriptionKey?: string, keywordsKey?: string) {
    const description = this.translate.instant(descriptionKey || 'META_DEFAULT_DESCRIPTION');
    const keywords = this.translate.instant(keywordsKey || 'META_DEFAULT_KEYWORDS');

    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ name: 'keywords', content: keywords });
  }
}

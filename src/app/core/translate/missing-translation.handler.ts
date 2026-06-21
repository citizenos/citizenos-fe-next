import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';

export class CosMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams): string {
    if (params.interpolateParams && 'default' in params.interpolateParams) {
      return params.interpolateParams['default'] as string;
    }
    return params.key;
  }
}

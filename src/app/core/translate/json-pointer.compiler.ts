import { TranslateCompiler } from '@ngx-translate/core';

export class JSONPointerCompiler extends TranslateCompiler {
  /**
   * Needed by ngx-translate
   */
  public override compile(value: string, _lang: string): string {
    return value;
  }

  /**
   * Triggered once from TranslateCompiler
   * Initiates recursive this.parseReferencePointers()
   * Returns modified translations object for ngx-translate to process
   */
  public override compileTranslations(translations: Record<string, unknown>, _lang: string): Record<string, unknown> {
    this.parseReferencePointers(translations, translations);
    return translations;
  }

  /**
   * Triggered once from this.compileTranslations()
   * Recursively loops through an object,
   * replacing any property value that has a string starting with "@:" with the referenced value.
   */
  private parseReferencePointers(currentTranslations: Record<string, unknown>, masterLanguageFile: Record<string, unknown>) {
    Object.keys(currentTranslations).forEach((key) => {
      if (currentTranslations[key] !== null && typeof currentTranslations[key] === 'object') {
        this.parseReferencePointers(currentTranslations[key] as Record<string, unknown>, masterLanguageFile);
        return;
      }

      if (typeof currentTranslations[key] === 'string') {
        const value = currentTranslations[key];
        if (value.startsWith('@:')) {
          let replacementProperty = this.getDescendantPropertyValue(masterLanguageFile, value.substring(2));
          
          if (!replacementProperty) {
            console.error('Missing translation reference: ', value);
            return;
          }

          let i = 0;
          // Follow nested references
          while (typeof replacementProperty === 'string' && replacementProperty.startsWith('@:')) {
            i++;
            const tryProp = replacementProperty;
            replacementProperty = this.getDescendantPropertyValue(masterLanguageFile, tryProp.substring(2));

            if (tryProp === replacementProperty || i > 10) {
              console.error('Translation loop or too deep for key:', tryProp);
              break;
            }
          }

          if (replacementProperty !== undefined && replacementProperty !== null) {
            currentTranslations[key] = replacementProperty;
          }
        }
      }
    });
  }

  /**
   * Takes a string representation of an objects dot notation
   * i.e. "APP_CORE.LABEL.LOCATION"
   * and returns the property value of the input objects property
   */
  private getDescendantPropertyValue(obj: Record<string, unknown>, desc: string): unknown {
    const arr = desc.split('.');
    let current: unknown = obj;
    while (arr.length) {
      const key = arr.shift();
      if (key && current !== null && typeof current === 'object' && (current as Record<string, unknown>)[key] !== undefined) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }
    return current;
  }
}

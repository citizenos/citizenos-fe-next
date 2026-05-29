import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cosEllipsis',
  standalone: true
})
export class CosEllipsisPipe implements PipeTransform {
  transform(value: string | null | undefined, limit = 128): string {
    if (!value || typeof value !== 'string') {
      return '';
    }

    return value.substring(0, limit) + (value.length > limit ? '...' : '');
  }
}

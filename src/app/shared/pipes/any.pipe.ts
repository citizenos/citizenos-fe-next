import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'any',
  standalone: true
})
export class AnyPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(value: any): any {
    return value;
  }
}

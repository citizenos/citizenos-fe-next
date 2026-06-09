import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'never',
  standalone: true,
})
export class NeverPipe implements PipeTransform {
  /**
   * This pipe is used for exhaustive switch checks in templates.
   * If the type of the value being switched over is correctly narrowed,
   * this method will only be reachable with a 'never' type.
   */
  transform(value: never): never {
    throw new Error(`Exhaustive switch check failed. Unexpected value: ${value}`);
  }
}

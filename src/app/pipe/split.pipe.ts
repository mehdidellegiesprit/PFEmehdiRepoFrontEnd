import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'split',
})
export class SplitPipe implements PipeTransform {
  transform(value: string, delimiter: string, index: number): string {
    let splitValue = value.split(delimiter);
    return splitValue[index] || '';
  }
}

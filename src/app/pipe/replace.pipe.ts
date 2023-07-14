import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replace',
})
export class ReplacePipe implements PipeTransform {
  transform(value: string, from: string, to: string): string {
    // Échappez les caractères spéciaux en utilisant '\\' avant chaque caractère spécial
    const escapedFrom = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return value.replace(new RegExp(escapedFrom, 'g'), to);
  }
}

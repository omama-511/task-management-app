import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {

  transform(value: string | Date, format: string = 'mediumDate'): string {
    if (!value) return '';
    return formatDate(value, format, 'en-US');
  }

}
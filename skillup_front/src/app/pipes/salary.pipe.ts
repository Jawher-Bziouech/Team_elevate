import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'salary' })
export class SalaryPipe implements PipeTransform {
  transform(value: string | undefined): string {
    if (!value) return '';
    // Expecting format like "50000-70000" or "50000 - 70000"
    const cleaned = value.replace(/\s+/g, '');
    const parts = cleaned.split('-');
    if (parts.length !== 2) return value;
    const min = this.formatNumber(Number(parts[0]));
    const max = this.formatNumber(Number(parts[1]));
    return `${min}–${max}`; // en-dash
  }

  private formatNumber(n: number): string {
    if (!isFinite(n)) return String(n);
    // if >=1000 -> show as '50k' for readability
    if (Math.abs(n) >= 1000) {
      const thousands = Math.round(n / 1000);
      return `${thousands}k`;
    }
    return String(n);
  }
}


import { Injectable } from '@angular/core';

const compare = (v1: string | number, v2: string | number) =>
    v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor() { }

    public dateSort(accountsList: any[], column: string, direction: string): any[] {
        return [...accountsList].sort((a, b) => {
            const dateA = new Date(a[column]);
            const dateB = new Date(b[column]);
            return direction === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        });
    }

    public onSort(items: any[], column: string, direction: string): any[] {
        if (direction === '' || column === '') {
            return items;
        }
        return [...items].sort((a, b) => {
            const res = compare(a[column], b[column]);
            return direction === 'asc' ? res : -res;
        });
    }

    public onSortPIN(invoice: any, column: string, direction: string): any[] {
        if (direction === '' || column === '') {
            invoice['pins'] = invoice?.pins;
        }
        return [...invoice?.pins].sort((a, b) => {
                const res = compare(a[column], b[column]);
                return direction === 'asc' ? res : -res;
        });
    }
    public onSortPINTable(pins: any, column: string, direction: string): any[] {
        if (direction === '' || column === '') {
            return pins;
        }
        return [pins].sort((a, b) => {
            const res = compare(a[column], b[column]);
            return direction === 'asc' ? res : -res;
        });
    }
}

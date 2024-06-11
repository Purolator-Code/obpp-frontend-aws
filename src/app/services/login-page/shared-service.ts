import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private localStorageSubject = new Subject<void>();

  localStorageChanges$ = this.localStorageSubject.asObservable();

  notifyLocalStorageChange() {
    this.localStorageSubject.next();
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServicesDataConfiguration } from '../../data-config/services-data-config';
import { LocalStorageService } from '../global/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class TermsConditionService {
  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {}

  servicesDataConfiguration = new ServicesDataConfiguration();

  submitAcceptTermsCondition(userName: string): Observable<any> {
    const httpOptions = {
      params: new HttpParams()
        .set('userName', userName)
        .set('ts', new Date().getTime()),
    };

    let lang = this.localStorageService.get('lang');
    let s_url = this.servicesDataConfiguration.acceptTermsFromEmail.replace("LANG_AUTH", lang);
    return this.http.post(
      this.servicesDataConfiguration.apiBaseURL+ s_url,
      null,
      httpOptions
    );
  }
}

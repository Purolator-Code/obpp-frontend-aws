import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServicesDataConfiguration } from '../../data-config/services-data-config';
import { LocalStorageService } from '../global/local-storage.service';

const httpOptions_t = {
  params: new HttpParams()
    .set('t', new Date().getTime())
    .set('ts', new Date().getTime()),
};

const httpOptions_ts = {
  params: new HttpParams().set('ts', new Date().getTime()),
};

@Injectable({
  providedIn: 'root',
})
export class OBPPUserRegisterService {
  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {}

  servicesDataConfiguration = new ServicesDataConfiguration();

  getAccountInfoForUserReg(
    accountNumber: string,
    postalCode: string
  ): Observable<any> {
    let lang = this.localStorageService.get('lang');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: '*/*',
      }),
      params: new HttpParams()
        .set('accountNumber', accountNumber)
        .append('postalCode', postalCode)
        .set('t', Date.now()),
    };
    return this.http.get(
      this.servicesDataConfiguration.apiBaseURL +
        this.servicesDataConfiguration.unAuthCheckPostalCode.replace(
          'LANG_AUTH',
          lang
        ),
      httpOptions
    );
  }

  getTermsAndConditionsUrl(): Observable<any> {
    let lang = this.localStorageService.get('lang');
    let s_url = this.servicesDataConfiguration.terms4UserReg.replace(
      'LANG_AUTH',
      lang
    );
    return this.http.post(
      this.servicesDataConfiguration.apiBaseURL + s_url,
      httpOptions_t
    );
  }

  registerNewUser(data: any): Observable<any> {
    let lang = this.localStorageService.get('lang');
    let s_url = this.servicesDataConfiguration.newuserRegisteration.replace(
      'LANG_AUTH',
      lang
    );
    return this.http.post(
      this.servicesDataConfiguration.apiBaseURL + s_url,
      data,
      httpOptions_t
    );
  }

  getUserInfo(id: any): Observable<any> {
    let httpOptions_get_user = {
      params: new HttpParams()
        .set('userGUID', id)
        .set('ts', new Date().getTime()),
    };
    let lang = this.localStorageService.get('lang');
    let s_url = this.servicesDataConfiguration.getUserInfo.replace(
      'LANG_AUTH',
      lang
    );
    return this.http.get(
      this.servicesDataConfiguration.apiBaseURL + s_url,
      httpOptions_get_user
    );
  }

  setPassword(data: any): Observable<any> {
    let lang = this.localStorageService.get('lang');
    let s_url = this.servicesDataConfiguration.setPassword.replace(
      'LANG_AUTH',
      lang
    );
    return this.http.post(
      this.servicesDataConfiguration.apiBaseURL + s_url,
      data,
      httpOptions_t
    );
  }
}

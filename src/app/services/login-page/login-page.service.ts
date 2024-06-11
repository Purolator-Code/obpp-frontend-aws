import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServicesDataConfiguration } from '../../data-config/services-data-config';
import { LocalStorageService } from '../global/local-storage.service';

const httpOptions = {
  params: new HttpParams()
    .set('t', new Date().getTime())
    .set('ts', new Date().getTime()),
};

const httpLoginOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  observe: 'response' as 'response',
};

@Injectable({
  providedIn: 'root',
})
export class OBPPLoginService {
  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {}

  servicesDataConfiguration = new ServicesDataConfiguration();

  x_csrf_token: string = '';
  userDetails: any = {};
  userName: string = '';
  lookupUserName: string = '';
  cpwaPaymentURL: string = '';
  isViewOnly: boolean = false;

  getIsViewOnly() {
    return this.isViewOnly;
  }

  getAuthToken() {
    return this.x_csrf_token;
  }

  setAuthToken(token: string): void {
    this.x_csrf_token = token;
  }

  getUserDetails() {
    return this.userDetails;
  }

  getCPWAPaymentURL() {
    return this.cpwaPaymentURL;
  }

  getUserName() {
    return this.userName;
  }

  getLookupUserName() {
    return this.lookupUserName;
  }

  login(username: string, password: string): Observable<any> {
    let lang = this.localStorageService.get('lang');
    return this.http.post(
      this.servicesDataConfiguration.apiBaseURL +
        this.servicesDataConfiguration.authURL.replace('LANG_AUTH', lang),
      { emailAddress: username, password: password },
      httpLoginOptions
    );
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(
      this.servicesDataConfiguration.apiBaseURL +
        this.servicesDataConfiguration.authURL +
        'signup',
      {
        username,
        email,
        password,
      },
      httpOptions
    );
  }

  unAuthCheckPostalCode(
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

  getLiveChatURL(): Observable<any> {
    let lang = this.localStorageService.get('lang');
    return this.http.get(
      this.servicesDataConfiguration.apiBaseURL +
        this.servicesDataConfiguration.liveChatURL.replace('LANG_AUTH', lang),
      httpOptions
    );
  }

  gteAnnouncements(): Observable<any> {
    let lang = this.localStorageService.get('lang');
    return this.http.get(
      this.servicesDataConfiguration.apiBaseURL +
        this.servicesDataConfiguration.announcements.replace('LANG_AUTH', lang),
      httpOptions
    );
  }

  getCPWAURL(): Observable<any> {
    let lang = this.localStorageService.get('lang');
    return this.http.get(
      this.servicesDataConfiguration.apiBaseURL +
        this.servicesDataConfiguration.cpwa_URL.replace('LANG_AUTH', lang),
      httpOptions
    );
  }

  sendEmailForgotPassword(email: string) {
    let lang = this.localStorageService.get('lang');
    return this.http.post(
      this.servicesDataConfiguration.apiBaseURL +
        this.servicesDataConfiguration.forgotPassword.replace(
          'LANG_AUTH',
          lang
        ),
      { emailAddress: email },
      httpOptions
    );
  }

  clearCache(uname: string) {
    return this.http.get(
      this.servicesDataConfiguration.apiBaseURL +
        this.servicesDataConfiguration.logoutURL.replace('{USER_NAME}', uname),
      httpOptions
    );
  }

  CPWAPaymentPost(data: any) {
    let quick_pay_url =
      '/billingcentre/obpp/service/app/quickpayCPWA/paymentencrypt/en';
    return this.http.post(
      this.servicesDataConfiguration.apiBaseURL + quick_pay_url,
      data,
      httpOptions
    );
  }
}

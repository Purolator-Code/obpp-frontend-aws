import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServicesDataConfiguration } from 'src/app/data-config/services-data-config';
import { LocalStorageService } from '../global/local-storage.service';

const httpOptions_t = {
  params: new HttpParams().set('t', new Date().getTime()),
};
@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  servicesDataConfiguration = new ServicesDataConfiguration();
  CPWAFrameURL: string = '';

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) { }

  getAnnouncement(): Observable<any> {
    let lang = this.localStorageService.get('lang');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: '*/*',
      }),
      params: new HttpParams().set('t', lang),
    };
    return this.http.get(
      this.servicesDataConfiguration.apiBaseURL +
      this.servicesDataConfiguration.announcements.replace('LANG_AUTH', lang),
      httpOptions
    );
  }

  getAccountDetails(email: string): Observable<any> {
    let lang = this.localStorageService.get('lang');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: '*/*',
      }),
      params: new HttpParams().set('userEmailId', email).set('ts', Date.now()),
    };
    return this.http.get(
      this.servicesDataConfiguration.apiBaseURL +
      this.servicesDataConfiguration.userProfile.replace('LANG_AUTH', lang),
      httpOptions
    );
  }

  getCreditCardDetails(email: string): Observable<any> {
    let lang = this.localStorageService.get('lang');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: '*/*',
      }),
      params: new HttpParams().set('userEmailId', email).set('ts', Date.now()),
    };
    return this.http.get(
      this.servicesDataConfiguration.apiBaseURL +
      this.servicesDataConfiguration.creditCardDetails.replace(
        'LANG_AUTH',
        lang
      ),
      httpOptions
    );
  }

  addCardDetails(data: any): Observable<any> {
    let lang = this.localStorageService.get('lang');
    let s_url = this.servicesDataConfiguration.addCardView.replace(
      'LANG_AUTH',
      lang
    );
    console.log(this.servicesDataConfiguration.apiBaseURL + s_url);

    return this.http.post(
      this.servicesDataConfiguration.apiBaseURL + s_url,
      data,
      httpOptions_t
    );
  }

  saveUserProfile(data: any): Observable<any> {
    let lang = this.localStorageService.get('lang');
    let s_url = this.servicesDataConfiguration.saveUserProfile.replace(
      'LANG_AUTH',
      lang
    );
    console.log(this.servicesDataConfiguration.apiBaseURL + s_url);

    return this.http.post(
      this.servicesDataConfiguration.apiBaseURL + s_url,
      data,
      httpOptions_t
    );
  }

  changePassword(data: any): Observable<any> {
    let lang = this.localStorageService.get('lang');
    let s_url = this.servicesDataConfiguration.changePassword.replace(
      'LANG_AUTH',
      lang
    );

    return this.http.post(
      this.servicesDataConfiguration.apiBaseURL + s_url,
      data,
      httpOptions_t
    );
  }

  removeCreditCard(data: any): Observable<any> {
    let lang = this.localStorageService.get('lang');
    let s_url = this.servicesDataConfiguration.removeCreditCard.replace(
      'LANG_AUTH',
      lang
    );

    return this.http.post(
      this.servicesDataConfiguration.apiBaseURL + s_url,
      data,
      httpOptions_t
    );
  }

  getCPWAFrameURL() {
    let lang = this.localStorageService.get('lang');
    let s_url = this.servicesDataConfiguration.CPWA_Frame_URL.replace(
      'LANG_AUTH',
      lang
    );

    return this.http.get(
      this.servicesDataConfiguration.apiBaseURL + s_url,
      httpOptions_t
    );
  }

}

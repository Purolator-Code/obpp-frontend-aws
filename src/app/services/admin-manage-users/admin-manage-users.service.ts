import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServicesDataConfiguration } from 'src/app/data-config/services-data-config';
import { LocalStorageService } from '../global/local-storage.service';

const httpOptions_ts = {
  params: new HttpParams().set('ts', new Date().getTime()),
};

const httpOptions_t = {
  params: new HttpParams().set('t', new Date().getTime()),
};

@Injectable({
  providedIn: 'root'
})

export class AdminManageUsersService {
  servicesDataConfiguration = new ServicesDataConfiguration();
  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) { }


  searchUsers(data: any, x_csrf_token: string): Observable<any> {
    let lang = this.localStorageService.get('lang');
    let s_url = this.servicesDataConfiguration.searchUsers.replace(
      'LANG_AUTH',
      lang
    );
    const searchValue = data.searchValue
    const searchType = data.searchType

    return this.http.get(
      this.servicesDataConfiguration.apiBaseURL + s_url + "?searchValue=" +
      searchValue +
      "&searchType=" +
      searchType,
      httpOptions_ts
    );
  }

  updateUserProfile(data: any, x_csrf_token: string): Observable<any> {
    let lang = this.localStorageService.get('lang');
    let s_url = this.servicesDataConfiguration.updateUserProfile.replace(
      'LANG_AUTH',
      lang
    );
    return this.http.post(
      this.servicesDataConfiguration.apiBaseURL + s_url, data,
      httpOptions_t
    );
  }

  createAccount(data: any, x_csrf_token: string): Observable<any> {
    let lang = this.localStorageService.get('lang');
    let s_url = this.servicesDataConfiguration.createAccount.replace(
      'LANG_AUTH',
      lang
    );
    return this.http.post(
      this.servicesDataConfiguration.apiBaseURL + s_url, data,
      httpOptions_t
    );
  }

  deleteUser(data: any, x_csrf_token: string): Observable<any> {
    let lang = this.localStorageService.get('lang');
    let s_url = this.servicesDataConfiguration.deleteUser.replace(
      'LANG_AUTH',
      lang
    );
    return this.http.post(
      this.servicesDataConfiguration.apiBaseURL + s_url, data,
      httpOptions_t
    );
  }

  reinstateUserProfile(data: any, x_csrf_token: string): Observable<any> {
    let lang = this.localStorageService.get('lang');
    let s_url = this.servicesDataConfiguration.reinstateUserProfile.replace(
      'LANG_AUTH',
      lang
    );
    return this.http.post(
      this.servicesDataConfiguration.apiBaseURL + s_url, data,
      httpOptions_t
    );
  }

  rejectUserProfile(data: any, x_csrf_token: string): Observable<any> {
    let lang = this.localStorageService.get('lang');
    let s_url = this.servicesDataConfiguration.rejectUserProfile.replace(
      'LANG_AUTH',
      lang
    );
    return this.http.post(
      this.servicesDataConfiguration.apiBaseURL + s_url, data,
      httpOptions_t
    );
  }

  approveUserProfile(data: any, x_csrf_token: string): Observable<any> {
    let lang = this.localStorageService.get('lang');
    let s_url = this.servicesDataConfiguration.approveUserProfile.replace(
      'LANG_AUTH',
      lang
    );
    return this.http.post(
      this.servicesDataConfiguration.apiBaseURL + s_url, data,
      httpOptions_t
    );
  }

  sendactivationlink(data: any, x_csrf_token: string): Observable<any> {
    let lang = this.localStorageService.get('lang');
    let s_url = this.servicesDataConfiguration.sendactivationlink.replace(
      'LANG_AUTH',
      lang
    );

    return this.http.get(
      this.servicesDataConfiguration.apiBaseURL + s_url + "?emailId=" + data, httpOptions_ts
    );
  };

  viewCustomerScreen(data: any, x_csrf_token: string): Observable<any> {
    let lang = this.localStorageService.get('lang');
    let s_url = this.servicesDataConfiguration.viewCustomerScreen.replace(
      'LANG_AUTH',
      lang
    );

    return this.http.get(
      this.servicesDataConfiguration.apiBaseURL + s_url + "?emailId=" + data, httpOptions_ts
    );
  };
}

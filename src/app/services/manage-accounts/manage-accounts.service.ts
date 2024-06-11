import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { ServicesDataConfiguration } from 'src/app/data-config/services-data-config';
import { LocalStorageService } from '../global/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ManageAccountsService {

  servicesDataConfiguration = new ServicesDataConfiguration();

  constructor(private http: HttpClient, private localStorageService: LocalStorageService) { }

  getAccountMasterDetails(email: string, csrfToken: string): Observable<any> {
    let lang = this.localStorageService.get("lang");
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept' : '*/*'}),
      params: new HttpParams().set('userEmailId', email).set('t', Date.now())
    };
    return this.http.get(this.servicesDataConfiguration.apiBaseURL + this.servicesDataConfiguration.accountMasterDetails.replace("LANG_AUTH", lang.toUpperCase()), httpOptions);
  }

  saveAccountMasterDetails(accountUpdatedDetails: any, csrfToken: string): Observable<any> {
    let lang = this.localStorageService.get("lang");
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept' : '*/*' , 'x-csrf-token' : csrfToken}),
      params: new HttpParams().set('t', Date.now())
    };
    return this.http.post(this.servicesDataConfiguration.apiBaseURL + this.servicesDataConfiguration.updateAccountChanges.replace("LANG_AUTH", lang.toUpperCase()), accountUpdatedDetails, httpOptions);
  }

  checkAccountNumberPostalCode(accountNumber: string, postalCode:string): Observable<any> {
    let lang = this.localStorageService.get("lang");
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept' : '*/*' }),
      params: new HttpParams().set('accountNumber', accountNumber).append('postalCode',postalCode).set('t', Date.now())
    };
    return this.http.get(this.servicesDataConfiguration.apiBaseURL + this.servicesDataConfiguration.checkPostalCode.replace("LANG_AUTH", lang), httpOptions);
  }

  async checkAccountNumberPostalCodeWithAsync(accountNumber: string, postalCode:string): Promise<any> {
    let lang = this.localStorageService.get("lang");
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept' : '*/*' }),
      params: new HttpParams().set('accountNumber', accountNumber).append('postalcode',postalCode).set('t', Date.now())
    };
    return await lastValueFrom(this.http.get(this.servicesDataConfiguration.apiBaseURL + this.servicesDataConfiguration.checkPostalCode.replace("LANG_AUTH", lang), httpOptions));
  }
}

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnrollAutoPay } from 'src/app/models/enrollAutopay';
import { ServicesDataConfiguration } from 'src/app/data-config/services-data-config';
import { LocalStorageService } from '../global/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class EnrollAutopayService {

  servicesDataConfiguration = new ServicesDataConfiguration();

  accountNumbers:string[] = [];
  
  constructor(private http: HttpClient, private localStorageService: LocalStorageService) { }

  checkEmail(email: string): Observable<any> {
    let lang = this.localStorageService.get("lang");
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept' : '*/*' }),
      params: new HttpParams().set('userEmailId', email).set('t', Date.now())
    };
    return this.http.get(this.servicesDataConfiguration.apiBaseURL + this.servicesDataConfiguration.checkEmail.replace("LANG_AUTH", lang), httpOptions);
  }

  checkAccountNumber(accountNumber: string): Observable<any> {
    let lang = this.localStorageService.get("lang");
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept' : '*/*' }),
      params: new HttpParams().set('accountNumber', accountNumber).set('t', Date.now())
    };
    return this.http.get(this.servicesDataConfiguration.apiBaseURL + this.servicesDataConfiguration.accountNumberInfo.replace("LANG_AUTH", lang), httpOptions);
  }

  fetchAccountId(accountNumber: string): Observable<any> {
    let lang = this.localStorageService.get("lang");
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept' : '*/*' }),
      params: new HttpParams().set('accountNumber', accountNumber).set('t', Date.now())
    };
    return this.http.get(this.servicesDataConfiguration.apiBaseURL + this.servicesDataConfiguration.accountIdInfo.replace("LANG_AUTH", lang), httpOptions);
  }

  fetchAccountStatus(accountNumber: string): Observable<any> {
    let lang = this.localStorageService.get("lang");
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept' : '*/*' }),
      params: new HttpParams().set('accountNumber', accountNumber).set('t', Date.now())
    };
    return this.http.get(this.servicesDataConfiguration.apiBaseURL + this.servicesDataConfiguration.autopayAccountInfo.replace("LANG_AUTH", lang.toUpperCase( )), httpOptions);
  }

  fetchAccountDetailsByCardId(crediCardId: string): Observable<any> {
    let lang = this.localStorageService.get("lang");
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept' : '*/*' }),
      params: new HttpParams().set('cardId', crediCardId).set('t', Date.now())
    };
    return this.http.get(this.servicesDataConfiguration.apiBaseURL + this.servicesDataConfiguration.creditCardInfo.replace("LANG_AUTH", lang.toUpperCase( )), httpOptions);
  }
  enrollAutoPay(enrollAutopay: EnrollAutoPay): Observable<any> {
    let lang = this.localStorageService.get("lang");
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept' : '*/*' }),
      params: new HttpParams().set('t', Date.now())
    };
    enrollAutopay.language = lang;
    return this.http.post<EnrollAutoPay>(this.servicesDataConfiguration.apiBaseURL + this.servicesDataConfiguration.registerToAutopay.replace("LANG_AUTH", lang), enrollAutopay, httpOptions);
  }
  
  /*Auto pay alone*/
  setAutoPay(enrollAutopay: EnrollAutoPay): Observable<any> {
    let lang = this.localStorageService.get("lang");
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept' : '*/*' }),
      params: new HttpParams().set('t', Date.now())
    };
    return this.http.post<EnrollAutoPay>(this.servicesDataConfiguration.apiBaseURL + this.servicesDataConfiguration.setAutopay.replace("LANG_AUTH", lang), enrollAutopay, httpOptions);
  }
  /*Auto pay alone*/
  fetchCurrentCreditCardList(emailId: string, csrfToken: string): Observable<any> {
    let lang = this.localStorageService.get("lang");
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept' : '*/*', 'x-csrf-token' : csrfToken }),
      params: new HttpParams().set('userName', emailId).set('t', Date.now())
    };
    return this.http.get(this.servicesDataConfiguration.apiBaseURL + this.servicesDataConfiguration.creditCardList.replace("LANG_AUTH", lang.toUpperCase( )), httpOptions);
  } 

  removeAutoPayAccounts(accountDetails: any, csrfToken: string) {
    let lang = this.localStorageService.get("lang");
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept' : '*/*', 'x-csrf-token' : csrfToken }),
    };
    return this.http.post(this.servicesDataConfiguration.apiBaseURL + this.servicesDataConfiguration.removeAutopayAccounts.replace("LANG_AUTH", lang.toUpperCase( )), accountDetails, httpOptions);
  }

  saveAutoPayAccounts(paymentDecrypt:any) {
    let lang = this.localStorageService.get("lang");
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept' : '*/*' }),
    };
    return this.http.post(this.servicesDataConfiguration.apiBaseURL + this.servicesDataConfiguration.saveAutoPayAccounts.replace("LANG_AUTH", lang.toUpperCase( )), paymentDecrypt, httpOptions);
  }

  checkPostalCode(accountNumber:string, postalCode:string){
    let lang = this.localStorageService.get("lang");
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept' : '*/*'}),
      params: new HttpParams().set('accountNumber', accountNumber).append('postalCode',postalCode).set('t', Date.now())
    };
    return this.http.get(this.servicesDataConfiguration.apiBaseURL + this.servicesDataConfiguration.checkPostalCode.replace("LANG_AUTH", lang.toUpperCase( )), httpOptions);
  }
}

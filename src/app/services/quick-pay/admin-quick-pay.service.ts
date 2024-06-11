import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServicesDataConfiguration } from '../../data-config/services-data-config';
import { LocalStorageService } from '../global/local-storage.service';

const httpOptions = {
    params: new HttpParams().set('t', new Date().getTime()).set('ts', new Date().getTime())
};


@Injectable({
    providedIn: 'root'
})
export class OBPPAdminQuickPayService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService
    ) { }

    servicesDataConfiguration = new ServicesDataConfiguration();

    quickPayData: any = [];
    selectedInvoice: string = "";

    searchByAccountOrInvoice(data: any): Observable<any> {
        let lang = this.localStorageService.get("lang");
        let s_url = this.servicesDataConfiguration.searchByAccountOrInvoice.replace("LANG_AUTH", lang);
        return this.http.post(this.servicesDataConfiguration.apiBaseURL + s_url, data, httpOptions);
    }

    searchByAccountNameOrAddress(data: any): Observable<any> {
        let lang = this.localStorageService.get("lang");
        let s_url = this.servicesDataConfiguration.searchByAccountNameOrAddress.replace("LANG_AUTH", lang);
        return this.http.post(this.servicesDataConfiguration.apiBaseURL + s_url, data, httpOptions);
    }

    searchByBillOfLading(data: any): Observable<any> {
        let lang = this.localStorageService.get("lang");
        let s_url = this.servicesDataConfiguration.searchByBillOfLading.replace("LANG_AUTH", lang);
        return this.http.post(this.servicesDataConfiguration.apiBaseURL + s_url, data, httpOptions);
    }

    getAccountSummaryFromAccountNumbers(data: any): Observable<any> {
        let lang = this.localStorageService.get("lang");
        let s_url = this.servicesDataConfiguration.accountSummaryFromAccountNumbers.replace("LANG_AUTH", lang);
        return this.http.post(this.servicesDataConfiguration.apiBaseURL + s_url, data, httpOptions);
    }
}
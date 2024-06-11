import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServicesDataConfiguration } from '../../data-config/services-data-config';
import { LocalStorageService } from '../global/local-storage.service';

const httpOptions = {
    params: new HttpParams().set('t', new Date().getTime()).set('ts', new Date().getTime())
};

const httpOptions4PDF = {
    params: new HttpParams().set('t', new Date().getTime()).set('ts', new Date().getTime()),
    responseType: 'blob' as 'json'
};


const httpOptions4CSV = {
    params: new HttpParams().set('t', new Date().getTime()).set('ts', new Date().getTime()),
    responseType: 'csv' as 'text',
};

const httpOptionsCI = {
    params: new HttpParams().set('page_index', 0)
        .set('accounts_per_page', 0)
        .set('account_numbers', '')
        .set('sort_descending', true)
        .set('start_date', new Date(Date.now() - 366 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
        .set('end_date', new Date(Date.now()).toISOString().slice(0, 10))
        .set('t', new Date().getTime())
        .set('ts', new Date().getTime()),
}


@Injectable({
    providedIn: 'root'
})
export class OBPPUserAccountSummaryService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService
    ) { }

    servicesDataConfiguration = new ServicesDataConfiguration();

    getShipmentTrackerURL(pin: string): Observable<any> {
        let s_url = this.servicesDataConfiguration.shipmentTrackerURL;
        return this.http.post(this.servicesDataConfiguration.apiBaseURL + s_url, pin, httpOptions);
    }

    getUserAccountSummaryByEmail(uname: string): Observable<any> {
        let lang = this.localStorageService.get("lang");
        let s_url = this.servicesDataConfiguration.accountSummaryUser.replace("LANG_AUTH", lang);
        s_url = s_url.replace("{USER_NAME}", uname);
        return this.http.get(this.servicesDataConfiguration.apiBaseURL + s_url, httpOptions);
    }

    getUserClosedAccountSummaryByEmail(uname: string): Observable<any> {
        let lang = this.localStorageService.get("lang");
        let s_url = this.servicesDataConfiguration.closedAccountSummary.replace("LANG_AUTH", lang);
        s_url = s_url.replace("{USER_NAME}", uname);
        return this.http.get(this.servicesDataConfiguration.apiBaseURL + s_url, httpOptionsCI);
    }

    getInvoicePDF(inv: string): Observable<Blob> {
        let lang = this.localStorageService.get("lang");
        let s_url = this.servicesDataConfiguration.invoicePDF.replace("LANG_AUTH", lang);
        s_url = s_url.replace("{INVOICE_NUMBER}", inv);
        return this.http.get<Blob>(this.servicesDataConfiguration.apiBaseURL + s_url, httpOptions4PDF);
    }

    submitPaymentToCPWAEncrypt(data: any) {
        let lang = this.localStorageService.get("lang");
        let s_url = this.servicesDataConfiguration.cpwa_acct_summary_encrypt.replace("LANG_AUTH", lang);
        return this.http.post(this.servicesDataConfiguration.apiBaseURL + s_url, data, httpOptions);
    }

    submitPaymentToCpwaDecrypt(data: any) {
        let lang = this.localStorageService.get("lang");
        let s_url = this.servicesDataConfiguration.cpwa_acct_summary_decrypt.replace("LANG_AUTH", lang);
        return this.http.post(this.servicesDataConfiguration.apiBaseURL + s_url, data, httpOptions);
    }

    accountStatementDownload(data: any): Observable<any> {
        let lang = this.localStorageService.get("lang");
        let s_url = this.servicesDataConfiguration.accountStatementDownload.replace("LANG_AUTH", lang);
        return this.http.get(this.servicesDataConfiguration.apiBaseURL + s_url + "?fromDate=" + data.fromDate +
            '&toDate=' + data.toDate + '&accountId=' + data.uname, httpOptions4CSV);
    }
}
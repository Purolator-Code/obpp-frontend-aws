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
export class OBPPDisputeInvoiceService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService
    ) { }

    servicesDataConfiguration = new ServicesDataConfiguration();

    submitDisputeInvoice(data: any): Observable<any> {
        let lang = this.localStorageService.get("lang");
        let s_url = this.servicesDataConfiguration.dispute_InvoiceURL.replace("LANG_AUTH", lang);
        return this.http.post(this.servicesDataConfiguration.apiBaseURL+ s_url, data, httpOptions);
    }


}
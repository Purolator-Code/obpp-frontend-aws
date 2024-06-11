import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServicesDataConfiguration } from '../../data-config/services-data-config';
import { LocalStorageService } from '../global/local-storage.service';
import { AdminServiceDataConfiguration } from 'src/app/data-config/admin-service-data-config';

const httpOptions = {
    params: new HttpParams().set('t', new Date().getTime()).set('ts', new Date().getTime())
};


@Injectable({
    providedIn: 'root'
})
export class AdminNotificationLogService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService
    ) { }

    _adminServicesDataConfiguration = new AdminServiceDataConfiguration();

    getNotificationLogMetaData(x_csrf_token:string): Observable<any> {
        let lang = this.localStorageService.get("lang");
        let s_url = this._adminServicesDataConfiguration.notificationLogMetaData.replace("LANG_AUTH", lang);
        return this.http.get(this._adminServicesDataConfiguration.apiBaseURL + s_url, httpOptions);
    }

    submitNotificationLogData(transactionLogData: any, x_csrf_token:string) {
        let lang = this.localStorageService.get("lang");
        let s_url = this._adminServicesDataConfiguration.notificationSearch.replace("LANG_AUTH", lang);
        return this.http.post(this._adminServicesDataConfiguration.apiBaseURL+ s_url, transactionLogData, httpOptions);
    }

    resendNotificationMail(transactionLogData: any, x_csrf_token:string) {
        let lang = this.localStorageService.get("lang");
        let s_url = this._adminServicesDataConfiguration.resendNotificationMail.replace("LANG_AUTH", lang);
        return this.http.post(this._adminServicesDataConfiguration.apiBaseURL+ s_url, transactionLogData, httpOptions);
    }

}
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServicesDataConfiguration } from '../../data-config/services-data-config';
import { LocalStorageService } from '../global/local-storage.service';

const httpOptions = {
  params: new HttpParams()
    .set('t', new Date().getTime())
    .set('ts', new Date().getTime()),
};

@Injectable({
  providedIn: 'root',
})
export class OBPPQuickPayService {
  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {}

  servicesDataConfiguration = new ServicesDataConfiguration();

  quickPayData: any = [];
  selectedInvoice: string = '';

  getQuickPayData() {
    return this.quickPayData;
  }

  getSelectedInvoice() {
    return this.selectedInvoice;
  }

  getAccountInfoByNumber(
    accNumber: string,
    invoiceNumber: string,
    postCode: string
  ): Observable<any> {
    let lang = this.localStorageService.get('lang');
    let s_url = this.servicesDataConfiguration.accountInfoQuickPay.replace(
      'LANG_AUTH',
      lang
    );
    s_url = s_url.replace('{ACCOUNT_NUMBER}', accNumber);
    s_url = s_url.replace('{INVOICE_NUMBER}', invoiceNumber);
    s_url = s_url.replace('{POSTAL_CODE}', postCode);
    return this.http.get(
      this.servicesDataConfiguration.apiBaseURL + s_url,
      httpOptions
    );
  }

  getQuickPaySecurityAudit(data: any) {
    let lang = this.localStorageService.get('lang');
    let s_url = this.servicesDataConfiguration.quickpay_security_audit.replace(
      'LANG_AUTH',
      lang
    );
    return this.http.post(
      this.servicesDataConfiguration.apiBaseURL + s_url,
      data,
      httpOptions
    );
  }
}

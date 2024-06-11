import { environment } from 'src/environments/environment';

export class AdminServiceDataConfiguration {
    private _apiBaseURL: string = environment.apiURL; //"https://dev-obpp.aws-purolator.com";
    private _transactionLogSearch: string =
        '/billingcentre/obpp/service/app/csr/searchTransactionLog/LANG_AUTH/';
    private _transactionSearchMetaData: string =
        '/billingcentre/obpp/service/app/csr/getCurrentHistoricalMonths/LANG_AUTH/';
    private _notificationSearchMetaData: string =
        '/billingcentre/obpp/service/app/getNotificationTypeList/LANG_AUTH/';
    private _notificationSearch : string =
        '/billingcentre/obpp/service/app/searchNotificationLog/LANG_AUTH/';
    private _resendNotificationMail : string =
    '/billingcentre/obpp/service/app/resendNotificationEmail/LANG_AUTH/';
    private _quickPayService : string =
    '/billingcentre/obpp/service/app/quickpayCPWA/paymentencrypt/LANG_AUTH/';
    private _viewCustomerScreenService : string =
    '/billingcentre/obpp/service/app/viewCustomerScreen/viewCust/LANG_AUTH';

    public get apiBaseURL(): string {
        return this._apiBaseURL;
    }
    public get transactionLogSearch(): string {
        return this._transactionLogSearch;
    }
    public get transactionLogMetaData(): string {
        return this._transactionSearchMetaData;
    }
    public get notificationLogMetaData(): string {
        return this._notificationSearchMetaData;
    }
    public get notificationSearch(): string {
        return this._notificationSearch;
    }

    public get resendNotificationMail(): string {
        return this._resendNotificationMail;
    }

    public get quickPayService(): string {
        return this._quickPayService;
    }

    public get viewCustomerScreenService(): string {
        return this._viewCustomerScreenService;
    }
    
    constructor() { }
}
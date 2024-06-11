import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DataSharingService {
    public isRefreshRequired: BehaviorSubject<string> = new BehaviorSubject<string>('yes');
    public isUserLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public isAdminLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false); 
    public IsLoadingEnabled: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public activeIdString: BehaviorSubject<string> = new BehaviorSubject<string>("");
    public isPaymentInProgress: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public sendEmailId: BehaviorSubject<string> = new BehaviorSubject<string>("");
    public qParamEmailId: BehaviorSubject<string> = new BehaviorSubject<string>("");
    public cancelPaymentPlan: BehaviorSubject<string> = new BehaviorSubject<string>("");
    public enrollForAutoPay: BehaviorSubject<any> = new BehaviorSubject<[]>([]);
    
}
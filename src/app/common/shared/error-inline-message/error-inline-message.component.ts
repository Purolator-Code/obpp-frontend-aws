import { Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { Alert } from '../../../models/error-inline-message.model';
import { LocalStorageService } from 'src/app/services/global/local-storage.service';
import { SharedService } from 'src/app/services/login-page/shared-service';

@Component({
  selector: 'error-inline-message',
  templateUrl: './error-inline-message.component.html',
  styleUrls: ['./error-inline-message.component.scss']
})
export class OBPPErrorInlineMessageComponent implements OnInit {
  constructor( private localStorageService: LocalStorageService,private sharedService: SharedService){
  }
  @Input() alerts: Alert[] = [];
  @Input() lang:string = "";

  close(alert: Alert) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }
  ngOnInit(): void {
    this.sharedService.localStorageChanges$.subscribe(() => {
     this.lang=this.localStorageService.get('lang');
    });
  }
  get hasAlertMessage(): boolean {
    return this.alerts.some(alert => this.lang === 'en' ? alert.messageEn.length > 0 : alert.messageFr.length > 0);
  }
}
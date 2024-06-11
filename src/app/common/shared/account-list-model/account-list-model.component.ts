import { Component, Input } from '@angular/core';
import { AccountList } from '../../../models/error-inline-message.model';

@Component({
  selector: 'account-list-model',
  templateUrl: './account-list-model.component.html',
  styleUrls: ['./account-list-model.component.scss']
})
export class OBPPAccountListModalComponent {

  @Input() alerts: AccountList[] = [];
  @Input() lang:string = "";

  closeModal(alert: AccountList) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }

}
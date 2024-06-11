import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination'
import { ObbpCsrUserRoutingModule } from './obbp-csr-user-routing.module';
import { ObppTransactionLogComponent } from './obpp-transaction-log/obpp-transaction-log.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TextMaskModule } from 'angular2-text-mask';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbAlertModule, NgbModule, NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedTranslateModule } from 'src/app/common/modules/shared-translate.module';
import { OBPPCsrHomeComponent } from './obpp-csr-home.component';
import { SharedOBPPModule } from 'src/app/common/modules/shared-obpp.module';
import { ObppNotificationLogComponent } from './obpp-notification-log/obpp-notification-log.component';
import { ObppLooseBillsComponent } from './obpp-loose-bills/obpp-loose-bills.component';
import { OBPPAdminQuickPayment } from './obpp-quick-pay/obpp-admin-quick-payment.component';

@NgModule({
  declarations: [
    ObppTransactionLogComponent,
    OBPPCsrHomeComponent,
    ObppNotificationLogComponent,
    ObppLooseBillsComponent,
    OBPPAdminQuickPayment
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    TextMaskModule,
    FontAwesomeModule,
    NgbTooltipModule,
    NgbModule,
    NgbAlertModule,
    NgbNavModule,
    SharedTranslateModule,
    CommonModule,
    ObbpCsrUserRoutingModule,
    SharedOBPPModule,
    NgxPaginationModule,
  ]
})
export class ObbpCsrUserModule { }

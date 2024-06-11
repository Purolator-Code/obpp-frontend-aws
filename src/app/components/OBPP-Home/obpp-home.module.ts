import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OBPPLoginComponent } from './OBPP-Login/obpp-login.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedTranslateModule } from 'src/app/common/modules/shared-translate.module';
import { OBPPQuickPayAnonymousComponent } from './obpp-quickpay-anonymous/obpp-quick-pay.component';
import { OBPPUserRegisterComponent } from './obpp-user-register/obpp-user-register.component';

import { OBPPErrorInlineMessageComponent } from '../../common/shared/error-inline-message/error-inline-message.component';
import { OBPPAccountListModalComponent } from '../../common/shared/account-list-model/account-list-model.component';

import {
  NgbTooltipModule,
  NgbTypeaheadModule,
  NgbAlertModule,
} from '@ng-bootstrap/ng-bootstrap';
import { TextMaskModule } from 'angular2-text-mask';
import { RouterModule } from '@angular/router';

import { ObppAutopayComponent } from './obpp-autopay/obpp-autopay.component';
import { OBPPLoaderComponent } from 'src/app/common/shared/loader-component/obpp-loader.component';
import { OBPPQuickPayment } from './obpp-quick-pay/obpp-quick-payment.component';
import { SharedOBPPModule } from 'src/app/common/modules/shared-obpp.module';
import { OBPPPaymentLoaderComponent } from 'src/app/common/shared/loader-payment-component/obpp-payment-loader.component';
import { OBPPActiveUser } from './obpp-active-user/obpp-active-user.component';

@NgModule({
  declarations: [
    OBPPLoginComponent,
    OBPPQuickPayAnonymousComponent,
    OBPPUserRegisterComponent,
    OBPPErrorInlineMessageComponent,
    OBPPAccountListModalComponent,
    ObppAutopayComponent,
    OBPPLoaderComponent,
    OBPPPaymentLoaderComponent,
    OBPPQuickPayment,
    OBPPActiveUser,
  ],
  exports: [
    OBPPLoginComponent,
    OBPPQuickPayAnonymousComponent,
    OBPPUserRegisterComponent,
    OBPPErrorInlineMessageComponent,
    OBPPAccountListModalComponent,
    OBPPLoaderComponent,
    OBPPPaymentLoaderComponent,
    OBPPQuickPayment,
    OBPPActiveUser,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    TextMaskModule,
    FontAwesomeModule,
    SharedOBPPModule,
    NgbTooltipModule,
    NgbAlertModule,
    NgbTypeaheadModule,
    SharedTranslateModule,
  ],
  providers: [],
})
export class OBPPHomeModule {}

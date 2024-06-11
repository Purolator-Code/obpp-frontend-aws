import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedTranslateModule } from 'src/app/common/modules/shared-translate.module';
import { NgbAccordionModule, NgbDropdownModule, NgbNavModule, NgbTooltipModule, NgbTypeaheadModule } from "@ng-bootstrap/ng-bootstrap";
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { TextMaskModule } from 'angular2-text-mask';
import {RouterModule} from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { OBPPUserHomeRoutingModule } from './obpp-user-home.routing';

import { OBPPUserHomeComponent } from './obpp-user-home.component';
import { OBPPUserAutoPayComponent } from './obpp-auto-pay/obpp-auto-pay.component';
import { OBPPUserAccountSummaryComponent } from './obpp-account-summary/obpp-account-summary.component';
import { OBPPUserAccountDisputeComponent } from './obpp-account-dispute/obpp-account-dispute.component';
import { OBPPUserProfileComponent } from './obpp-user-profile/obpp-user-profile.component';
import { OBPPUserManageAccountsComponent } from './obpp-manage-accounts/obpp-manage-accounts.component';
import { ObppUserHomeTabsComponent } from './obpp-user-tabs/obpp-user-tabs.component';
import { SharedOBPPModule } from 'src/app/common/modules/shared-obpp.module';


@NgModule({
  declarations: [
    OBPPUserHomeComponent,
    ObppUserHomeTabsComponent,
    OBPPUserAutoPayComponent,
    OBPPUserAccountSummaryComponent,
    OBPPUserAccountDisputeComponent,
    OBPPUserManageAccountsComponent,
    OBPPUserProfileComponent,
  ],
  exports: [
    OBPPUserHomeComponent,
    ObppUserHomeTabsComponent,
    OBPPUserAutoPayComponent,
    OBPPUserAccountSummaryComponent,
    OBPPUserAccountDisputeComponent,
    OBPPUserManageAccountsComponent,
    OBPPUserProfileComponent,
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
    NgbNavModule,
    NgbAccordionModule,
    NgbDropdownModule,
    NgbTypeaheadModule,
    SharedTranslateModule,
    NgxPaginationModule,
    OBPPUserHomeRoutingModule,
  ],
  providers: []
})
export class OBPPUserHomeModule {
 }

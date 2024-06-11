import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TextMaskModule } from 'angular2-text-mask';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbAlertModule, NgbModule, NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedTranslateModule } from 'src/app/common/modules/shared-translate.module';
import { viewCustomerScreenComponent } from './obpp-view-customer-screen.component';
import { ObppViewUserHomeTabsComponent } from './obpp-view-customer-tabs/obpp-view-userSceen-tabs.component';
import { OBPPViewUserHomScreenRoutingModule } from './obpp-view-customer-screen-routing.module';




@NgModule({
  declarations: [
    viewCustomerScreenComponent,
    ObppViewUserHomeTabsComponent,

    
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
    OBPPViewUserHomScreenRoutingModule,
  ]
})
export class ObbpCsrViewCustomerScreenModule { }

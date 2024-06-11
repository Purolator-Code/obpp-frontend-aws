import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  HttpClient,
  HttpClientModule,
  HttpClientXsrfModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import {
  LocationStrategy,
  HashLocationStrategy,
  CurrencyPipe,
} from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { TextMaskModule } from 'angular2-text-mask';
import { NgxPaginationModule } from 'ngx-pagination';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { HomeComponent } from './components/OBPP-Home/obpp-home.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';

//Modals, shared components
import { OBPPModalDialogComponent } from './components/error-component/modal-dialog/modal-dialog.component';
import { OBPPModalForgotPasswordComponent } from './common/shared/pop-up-modal/modal-forgot-password/modal-forgot-password.component';

//Components
import { OBPPHeaderComponent } from './components/OBPP-Home/obpp-header-component/obpp-header.component';
import { OBPPFooterComponent } from './components/OBPP-Home/obpp-footer-component/obpp-footer.component';
import { OBPPError404Component } from './components/error-component/error-404/error-404.component';

//Modules
import { OBPPHomeModule } from './components/OBPP-Home/obpp-home.module';
import { OBPPUserHomeModule } from './components/obpp-normal-user/obpp-user-home.module';
import { ObbpCsrUserModule } from './components/obbp-csr-user/obbp-csr-user.module';

//Interceptors
import { AuthInterceptor } from './common/http-interceptors/auth.interceptor';
import { ModalChangePasswordComponent } from './common/shared/pop-up-modal/modal-change-password/modal-change-password.component';
import { OBPPQuickPayInvoiceComponent } from './common/shared/pop-up-modal/modal-quick-pay-invoice/modal-quick-pay-invoice.component';
import { ModalDeleteCreditcardComponent } from './common/shared/pop-up-modal/modal-delete-creditcard/modal-delete-creditcard.component';
import { ModelDeleteEnrolledautopayuserComponent } from './common/shared/pop-up-modal/model-delete-enrolledautopayuser/model-delete-enrolledautopayuser.component';
import { ObppManageUsersComponent } from './components/obpp-administrator/obpp-manage-users/obpp-manage-users.component';
import { ObppEnrollAutopayComponent } from './components/OBPP-Home/obpp-enroll-autopay/obpp-enroll-autopay.component';
import { ModalDeleteUserComponent } from './common/shared/pop-up-modal/modal-delete-user/modal-delete-user.component';
import { ModalRejectUserComponent } from './common/shared/pop-up-modal/modal-reject-user/modal-reject-user.component';
import { ModalSendTempPwdComponent } from './common/shared/pop-up-modal/modal-send-temp-pwd/modal-send-temp-pwd.component';
import { ModalTemppwdSuccessComponent } from './common/shared/pop-up-modal/modal-temppwd-success/modal-temppwd-success.component';

import { OBPPAdminQuickPayInvoiceComponent } from './common/shared/pop-up-modal/modal-admin-quick-pay-invoice/modal-admin-quick-pay-invoice.component';

import { ModalUserLoginComponent } from './common/shared/pop-up-modal/modal-user-login/modal-user-login.component';
import { TermsConditionComponent } from './components/terms-condition/terms-condition.component';
import { ModalTermsConditionComponent } from './common/shared/pop-up-modal/modal-terms-condition/modal-terms-condition.component';
import { ModelLoginAttemptsExceedsComponent } from './common/shared/pop-up-modal/model-login-attempts-exceeds/model-login-attempts-exceeds.component';
import { ModelEmailNotificationComponent } from './common/shared/pop-up-modal/model-email-notification/model-email-notification.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    OBPPHeaderComponent,
    OBPPFooterComponent,
    OBPPError404Component,
    OBPPModalDialogComponent,
    OBPPModalForgotPasswordComponent,
    ModalChangePasswordComponent,
    OBPPQuickPayInvoiceComponent,
    ModalDeleteCreditcardComponent,
    ModelDeleteEnrolledautopayuserComponent,
    ObppManageUsersComponent,
    ModelDeleteEnrolledautopayuserComponent,
    ObppEnrollAutopayComponent,
    ModalDeleteUserComponent,
    ModalRejectUserComponent,
    ModalSendTempPwdComponent,
    ModalTemppwdSuccessComponent,
    ModalUserLoginComponent,
    OBPPAdminQuickPayInvoiceComponent,
    TermsConditionComponent,
    ModalTermsConditionComponent,
    ModelLoginAttemptsExceedsComponent,
    ModelEmailNotificationComponent,
  ],
  exports: [],
  imports: [
    NgIdleKeepaliveModule.forRoot(),
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TextMaskModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'X-Csrf-Token',
      headerName: 'X-Csrf-Token',
    }),
    NgbModule,
    NgxPaginationModule,
    OBPPHomeModule,
    OBPPUserHomeModule,
    ObbpCsrUserModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    CurrencyPipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

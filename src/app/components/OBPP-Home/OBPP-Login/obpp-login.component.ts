import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OBPPModalForgotPasswordComponent } from 'src/app/common/shared/pop-up-modal/modal-forgot-password/modal-forgot-password.component';
import { OBPPModalDialogComponent } from '../../error-component/modal-dialog/modal-dialog.component';
import { UserDetailsModel } from '../../../models/user-details.model';
import { GlobalDataConfiguration } from '../../../data-config/global-data-config';
import { LocalStorageService } from '../../../services/global/local-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
import { Router } from '@angular/router';
import { ModalChangePasswordComponent } from 'src/app/common/shared/pop-up-modal/modal-change-password/modal-change-password.component';
import { ModelLoginAttemptsExceedsComponent } from 'src/app/common/shared/pop-up-modal/model-login-attempts-exceeds/model-login-attempts-exceeds.component';

@Component({
  selector: 'obpp-login',
  templateUrl: './obpp-login.component.html',
  styleUrls: ['./obpp-login.component.scss'],
})
export class OBPPLoginComponent implements OnInit {
  @ViewChild('myCheckbox') myCheckbox: ElementRef | undefined;
  @Output() updateErrorMessage = new EventEmitter();
  content?: string;
 
  username: string = '';
  pwd: string = '';
  fieldErrorsObj: any = [];
  submitted: boolean = false;
  LoginForm: FormGroup;
  accountLocked: boolean = false;
  userDetails: UserDetailsModel = new UserDetailsModel();
  globalDataConfiguration: GlobalDataConfiguration =
    new GlobalDataConfiguration();
  showPassword: boolean = false;
  loginAttempted:boolean=false;
  emailRegex =
    '[a-zA-Z0-9_+S-]*(?=[a-zA-Z0-9](?![.]{2}).+)([a-zA-Z0-9_+.S-])*([a-zA-Z0-9-S_+S-]+)\\@(([a-zA-Z0-9-S])+\\.)+([a-zA-Z0-9S]{2,10})';
  userprofile = {
    emailAddress: '',
    confirmPassword: '',
    newPassword: '',
    currentPassword: '',
  };
  isChangePwd: boolean = false;

  constructor(
    private obppAuthService: OBPPLoginService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private localStorageService: LocalStorageService,
    private translate: TranslateService,
    private router: Router,
    private dataSharingService: DataSharingService
  ) {
    this.LoginForm = this.fb.group({
      email: [
        '',
        [Validators.required, Validators.pattern('^' + this.emailRegex + '$')],
      ],
      password: ['', Validators.required],
      remember: '',
    });
  }

  ngOnInit() {
    this.submitted = false;
    let user = this.localStorageService.get(window.btoa('obppusername'));
    if (user) {
      this.LoginForm.get('email')?.setValue(window.atob(user));
      this.LoginForm.get('remember')?.setValue(true);
    }
    this.accountLocked=false;
  }
  checkOnEnter(event: any): void {
    event.preventDefault(); 
    if (this.myCheckbox) {
      this.myCheckbox.nativeElement.checked = !this.myCheckbox.nativeElement.checked;
    }
  }

  onSubmit() {
    this.submitted = true;
    if ((this.LoginForm.valid && this.LoginForm.dirty)||this.loginAttempted) {
      let username = this.LoginForm.get('email')?.value;
      let pwd = this.LoginForm.get('password')?.value;
      let rem = this.LoginForm.get('remember')?.value;
      this.dataSharingService.IsLoadingEnabled.next(true);
      this.obppAuthService.login(username, pwd).subscribe({
        next: (data) => {
          let type = data.body.serviceResponse.type;
          let message=data.body.serviceResponse.message;
          if(type == 'error' && message == 'ACCOUNT_LOCKED'){
            this.LoginForm.disable();
            this.loginAttempted=true;
            this.modalService.open(ModelLoginAttemptsExceedsComponent);
          }
          else if (type == 'error') {
            this.fieldErrorsObj = [];
            this.fieldErrorsObj.push({
              key: '',
              message: data.body.serviceResponse.message,
            });
            this.updateErrorMessage.emit(this.fieldErrorsObj);
          } else if (type == 'success') {
            this.userDetails.serviceResponse = data.body.serviceResponse.object;
            const userStatus: string =
              this.userDetails.serviceResponse.obppUserstatus;
            const language =
              data.body.serviceResponse.object.language.toLowerCase();
              this.loginAttempted=false;
            //this.translate.setDefaultLang(language);
            //this.localStorageService.remove('lang');
            //this.localStorageService.set('lang', language);
            this.dataSharingService.IsLoadingEnabled.next(false);
            const roleName = data.body.serviceResponse.object.roleDto.roleName;
            const sendEmailNotification =
              data.body.serviceResponse.object.sendEmailNotification;
            this.obppAuthService.userDetails['serviceResponse'] =
              data.body.serviceResponse.object;
            this.obppAuthService.x_csrf_token =
              data.headers.get('x-csrf-token');
            this.obppAuthService.userName = username;
            this.localStorageService.set(
              window.btoa('obpprole'),
              window.btoa(roleName)
            );
            this.localStorageService.set(
              window.btoa('sendEmail'),
              window.btoa(sendEmailNotification)
            );
            if (
              data.body.serviceResponse.object.userPreferenceDto[0]
                .preferenceName === 'Payment Notification'
            ) {
              this.localStorageService.set(
                window.btoa('sendPaymentNotification'),
                window.btoa(
                  data.body.serviceResponse.object.userPreferenceDto[0]
                    .preferenceValue
                )
              );
            } else if (
              data.body.serviceResponse.object.userPreferenceDto[1]
                .preferenceName === 'Payment Notification'
            ) {
              this.localStorageService.set(
                window.btoa('sendPaymentNotification'),
                window.btoa(
                  data.body.serviceResponse.object.userPreferenceDto[1]
                    .preferenceValue
                )
              );
            }
            if (rem) {
              this.localStorageService.set(
                window.btoa('obppusername'),
                window.btoa(username)
              );
            }
            if (userStatus === 'R') {
              this.dataSharingService.IsLoadingEnabled.next(false);
              this.changePassword();
              return;
            }

            this.successLogin();
          } else {
            this.fieldErrorsObj = data.body.serviceResponse.object.fieldErrors;
            this.updateErrorMessage.emit(this.fieldErrorsObj);
          }
          this.dataSharingService.IsLoadingEnabled.next(false);
        },
        error: (err) => {
          this.dataSharingService.IsLoadingEnabled.next(false);
        },
      });
    }
  }

  successLogin() {
    this.dataSharingService.isUserLoggedIn.next(true);
    this.updateErrorMessage.emit([]);

    const role: any = this.userDetails.serviceResponse.roleDto;

    if (role['roleName'] === 'User' || role['roleName'] == 'Customer') {
      this.router.navigateByUrl('/user/account-summary');
      this.dataSharingService.activeIdString.next('/user/account-summary');
    } else if (
      role['roleName'] === 'Administrator' ||
      role['roleName'] === 'CSR' ||
      role['roleName'] === 'CSR Supervisor'
    ) {
      this.router.navigateByUrl('/manageusers');
      this.dataSharingService.activeIdString.next('/manageusers');
      this.dataSharingService.isAdminLoggedIn.next(true);
    }
  }

  forgotPassword() {
    let errMsg = 'EMAIL_ENTER';
    let tit = 'PASSWORD_FORGOT';
    this.sendForgotPassword(tit, errMsg, 'OK', 'CANCEL_TEXT', 'warning');
  }

  sendForgotPassword(
    title: string,
    errorMsg: string,
    firstButtonLabel: any,
    secondButtonLabel: any,
    modalType: string
  ) {
    const modalRef = this.modalService.open(OBPPModalForgotPasswordComponent);
    modalRef.componentInstance.my_modal_title = title;
    modalRef.componentInstance.my_modal_content = errorMsg;
    modalRef.componentInstance.firstButtonLabel = firstButtonLabel;
    modalRef.componentInstance.secondButtonLabel = secondButtonLabel;
    modalRef.componentInstance.modalType = modalType;

    modalRef.componentInstance.successAction.subscribe(($e: any) => {
      this.obppAuthService.sendEmailForgotPassword($e).subscribe({
        next: (res) => {
          let errMsg = 'FORGOT_PSWD_EMAIL_SENT_TEXT';
          this.isChangePwd = false;
          this.openModal(
            'MAIL_SENT_SUCCESSFULLY',
            errMsg,
            '',
            'OK',
            null,
            'warning'
          );
        },
        error: (error) => {
          console.log(error);
        },
      });
    });
  }

  changePassword() {
    let errMsg = 'NEW_AND_CONFIRM_PASSWORD_MISMATCH';
    let tit = 'CHANGE_PASS';
    let desc = 'CHANGE_PASS_INSTRUCTIONS';
    this.userprofile.emailAddress = this.LoginForm.get('email')?.value;
    this.sendChangePassword(
      tit,
      errMsg,
      desc,
      'OK',
      'CANCEL_TEXT',
      'success',
      this.userprofile
    );
  }

  sendChangePassword(
    title: string,
    errorMsg: string,
    desc: string,
    firstButtonLabel: any,
    secondButtonLabel: any,
    modalType: string,
    user_data: any
  ) {
    const modalRef = this.modalService.open(ModalChangePasswordComponent);
    modalRef.componentInstance.my_modal_title = title;
    modalRef.componentInstance.my_modal_content = errorMsg;
    modalRef.componentInstance.modal_desc = desc;
    modalRef.componentInstance.firstButtonLabel = firstButtonLabel;
    modalRef.componentInstance.secondButtonLabel = secondButtonLabel;
    modalRef.componentInstance.modalType = modalType;
    modalRef.componentInstance.user_data = user_data;
    modalRef.componentInstance.successAction.subscribe(
      ($e: any) => {
        let desc = 'PASSWORD_UPDATED_SUCCESSFULLY';
        let title = 'PASSWORD_CHANGE';
        this.isChangePwd = true;
        this.openModal(
          title,
          'PASSWORD_UPDATED_SUCCESSFULLY',
          desc,
          'OK',
          null,
          'warning'
        );
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  openModal(
    title: string,
    errorMsg: string,
    desc: any,
    firstButtonLabel: any,
    secondButtonLabel: any,
    modalType: string
  ) {
    const modalRef = this.modalService.open(OBPPModalDialogComponent);
    modalRef.componentInstance.my_modal_title = title;
    modalRef.componentInstance.my_modal_content = errorMsg;
    modalRef.componentInstance.modal_desc = desc;
    modalRef.componentInstance.firstButtonLabel = firstButtonLabel;
    modalRef.componentInstance.secondButtonLabel = secondButtonLabel;
    modalRef.componentInstance.modalType = modalType;
    modalRef.componentInstance.successAction.subscribe(($e: any) => {
      if (this.isChangePwd) {
        this.isChangePwd = false;
        this.successLogin();
      }
    });
  }
}

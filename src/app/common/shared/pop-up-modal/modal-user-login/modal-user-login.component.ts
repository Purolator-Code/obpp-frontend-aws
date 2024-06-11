import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { OBPPModalDialogComponent } from 'src/app/components/error-component/modal-dialog/modal-dialog.component';
import { UserDetailsModel } from 'src/app/models/user-details.model';
import { LocalStorageService } from 'src/app/services/global/local-storage.service';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';
import { UserProfileService } from 'src/app/services/user-profile/user-profile.service';
import { OBPPModalForgotPasswordComponent } from '../modal-forgot-password/modal-forgot-password.component';

@Component({
  selector: 'app-modal-user-login',
  templateUrl: './modal-user-login.component.html',
  styleUrls: ['./modal-user-login.component.scss'],
})
export class ModalUserLoginComponent implements OnInit {
  @Input() my_modal_title: string = '';
  @Input() my_modal_content: string = '';
  @Input() modal_desc: string = '';
  @Input() firstButtonLabel: string = '';
  @Input() secondButtonLabel: string = '';
  @Input() modalType: string = '';
  @Input() user_data: any;
  @Output() successAction = new EventEmitter();
  @Output() cancelAction = new EventEmitter();
  @Input() username: any;
  password: string = '';
  changeForm!: FormGroup;
  displayErrorMsgBlock: boolean = false;
  remember: boolean = false;
  errMsg: string = '';
  userDetails: UserDetailsModel = new UserDetailsModel();

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private dataSharingService: DataSharingService,
    private translate: TranslateService,
    private modalService: NgbModal,
    private obppAuthService: OBPPLoginService,
    private route: ActivatedRoute,
    private router: Router,
    private localStorageService: LocalStorageService
  ) {
    
  }

  ngOnInit(): void {
    this.changeForm = this.fb.group({
      username: [
        this.username,
        [
          Validators.required,
          Validators.pattern("^[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,7}$")
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(15)
        ],
      ],
      remember: ''
    });
  }

  successActionFunc(changePasswordData: any) {
    if (this.changeForm.valid && this.changeForm.dirty) {
      let username = this.changeForm.get("username")?.value;
      let pwd = this.changeForm.get("password")?.value;
      let rem = this.changeForm.get("remember")?.value;
      this.dataSharingService.IsLoadingEnabled.next(true);
      this.obppAuthService.login(username, pwd).subscribe(data => {
        let type = data.body.serviceResponse.type;
        if (type == "error") {
          this.displayErrorMsgBlock = true;
          this.errMsg = data.body.serviceResponse.message;
          this.dataSharingService.IsLoadingEnabled.next(false);
        } else if (type == "success") {
          this.displayErrorMsgBlock = false;
          this.userDetails.serviceResponse = data.body.serviceResponse.object;
          const language = data.body.serviceResponse.object.language.toLowerCase()
          this.translate.setDefaultLang(language);
          this.localStorageService.remove('lang');
          this.localStorageService.set('lang',language);
          this.dataSharingService.IsLoadingEnabled.next(false);
          const roleName = data.body.serviceResponse.object.roleDto.roleName;
          this.obppAuthService.userDetails['serviceResponse'] = data.body.serviceResponse.object;
          this.obppAuthService.x_csrf_token = data.headers.get("x-csrf-token");
          this.obppAuthService.userName = username;
          this.localStorageService.set(window.btoa("obpprole"), window.btoa(roleName));
          if (rem) {
            this.localStorageService.set(window.btoa("obppusername"), window.btoa(username));
          }
          this.dataSharingService.isUserLoggedIn.next(true);
          //TODO this.updateErrorMessage.emit([]);
          const role: any = this.userDetails.serviceResponse.roleDto
          this.activeModal.close('OK');
          this.dataSharingService.IsLoadingEnabled.next(false);
          this.successAction.emit();
          if (role['roleName'] === "User" || role['roleName'] == "Customer") {
            this.router.navigateByUrl("/user/autopay"), { relativeTo: this.route }
            this.dataSharingService.activeIdString.next("/user/account-summary");
          } else if (role['roleName'] === "Administrator"){
            this.router.navigateByUrl("/manageusers"), { relativeTo: this.route }
            this.dataSharingService.activeIdString.next("/manageusers");
          }
          if(data.body.serviceResponse.object.roleDto && 
            data.body.serviceResponse.object.roleDto.roleName == 'Administrator') {
              this.router.navigateByUrl("/manageusers"), { relativeTo: this.route }
              this.dataSharingService.isAdminLoggedIn.next(true);
          } else {
            this.router.navigateByUrl("/user/autopay"), {relativeTo: this.route}
            this.dataSharingService.activeIdString.next("/user/autopay");
          }
          
        } else {
          //TODO this.updateErrorMessage.emit(this.fieldErrorsObj);
          this.displayErrorMsgBlock = true;
          this.errMsg = data.body.serviceResponse.message;
          this.dataSharingService.IsLoadingEnabled.next(false);
        }
        this.dataSharingService.IsLoadingEnabled.next(false);
      }, err => {
        console.log(err);
        this.dataSharingService.IsLoadingEnabled.next(false);
      })
    }
  }

  cancelActionFunc() {
    this.username = '';
    this.password = '';
    this.cancelAction.emit('');
    this.activeModal.close('Cancel');
  }
  forgotPassword() {
    let errMsg = "EMAIL_ENTER";
    let tit = "PASSWORD_FORGOT";
    this.sendForgotPassword(tit, errMsg, "OK", "CANCEL_TEXT", "warning");
  }


  sendForgotPassword(title: string, errorMsg: string, firstButtonLabel: any, secondButtonLabel: any, modalType: string) {
    const modalRef = this.modalService.open(OBPPModalForgotPasswordComponent);
    modalRef.componentInstance.my_modal_title = title;
    modalRef.componentInstance.my_modal_content = errorMsg;
    modalRef.componentInstance.firstButtonLabel = firstButtonLabel;
    modalRef.componentInstance.secondButtonLabel = secondButtonLabel;
    modalRef.componentInstance.modalType = modalType;

    modalRef.componentInstance.successAction.subscribe(($e: any) => {
      this.obppAuthService.sendEmailForgotPassword($e).subscribe(res => {
        let errMsg = "FORGOT_PSWD_EMAIL_SENT_TEXT";
        let tit = "MAIL_SENT_SUCCESSFULLY";
        this.openModal("MAIL_SENT_SUCCESSFULLY", errMsg, "OK", null, "warning");
      }, error => {
        console.log(error);
        // let errMsg = "The temporary password has been successfully sent to your email address\n\n";
        // let tit = "Mail sent successfully";
        // this.openModal("MAIL_SENT_SUCCESSFULLY", "FORGOT_PSWD_EMAIL_SENT_TEXT", "OK", null, "warning");
      })
    });

    modalRef.componentInstance.cancelAction.subscribe(($e: any) => {
      console.log($e);
    })
  }

  openModal(title: string, errorMsg: string, firstButtonLabel: any, secondButtonLabel: any, modalType: string) {
    const modalRef = this.modalService.open(OBPPModalDialogComponent);
    modalRef.componentInstance.my_modal_title = title;
    modalRef.componentInstance.my_modal_content = errorMsg;
    modalRef.componentInstance.firstButtonLabel = firstButtonLabel;
    modalRef.componentInstance.secondButtonLabel = secondButtonLabel;
    modalRef.componentInstance.modalType = modalType;

    modalRef.componentInstance.successAction.subscribe(($e: any) => {
      console.log($e);
    });

    modalRef.componentInstance.cancelAction.subscribe(($e: any) => {
      console.log($e);
    })
  }

}

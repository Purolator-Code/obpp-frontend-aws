import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OBPPModalForgotPasswordComponent } from 'src/app/common/shared/pop-up-modal/modal-forgot-password/modal-forgot-password.component';
import { OBPPModalDialogComponent } from 'src/app/components/error-component/modal-dialog/modal-dialog.component';
import { ModelEmailNotificationComponent } from '../model-email-notification/model-email-notification.component';

@Component({
  selector: 'app-model-login-attempts-exceeds',
  templateUrl: './model-login-attempts-exceeds.component.html',
  styleUrls: ['./model-login-attempts-exceeds.component.css']
})
export class ModelLoginAttemptsExceedsComponent  {

  isChangePwd: boolean = false;

  constructor(public activeModal: NgbActiveModal,
    private obppAuthService: OBPPLoginService,
    private modalService: NgbModal) {}

  cancelAccountRemoval() {
    let errMsg = 'EMAIL_ENTER';
    let tit = 'PASSWORD_FORGOT';
    this.sendForgotPassword(tit, errMsg, 'OK', 'CANCEL_TEXT', 'warning');
    this.activeModal.close();
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
         // let errMsg = 'FORGOT_PSWD_EMAIL_SENT_TEXT';
          this.isChangePwd = false;
          this.modalService.open(ModelEmailNotificationComponent)
        }
      });
    });
  }
  //this.activeModal.close('OK');

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
        //this.successLogin();
      }
    });
  }

}

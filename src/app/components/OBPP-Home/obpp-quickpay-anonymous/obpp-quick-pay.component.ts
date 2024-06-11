import { Component } from '@angular/core';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OBPPModalDialogComponent } from '../../error-component/modal-dialog/modal-dialog.component';
import { OBPPQuickPayService } from 'src/app/services/quick-pay/quick-pay.service';
import { QuickPaySecurityAudit } from 'src/app/models/new-user-registration.model';
import { Router } from '@angular/router';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';

@Component({
  selector: 'obpp-quick-pay-anonymous',
  templateUrl: './obpp-quick-pay.component.html',
  styleUrls: ['./obpp-quick-pay.component.scss'],
})
export class OBPPQuickPayAnonymousComponent {
  content?: string;

  username: string = '';
  pwd: string = '';

  QuickPayForm: FormGroup;
  isDuplicatePay = false;
  secAuditData?: QuickPaySecurityAudit | any;
  isPostalCodeDisabled: boolean = false;
  isInvoiceNumberDisabled: boolean = false;
  constructor(
    private obppAuthService: OBPPLoginService,
    private obppQuickPayService: OBPPQuickPayService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private route: Router,
    private dataSharingService: DataSharingService
  ) {
    this.QuickPayForm = this.fb.group({
      accountNumber: ['', Validators.required],
      invoiceNumber: [''],
      postalCode: [''],
    });
  }

  validateFields() {
    this.QuickPayForm.get('accountNumber')?.markAsDirty();
    this.QuickPayForm.get('invoiceNumber')?.markAsDirty();
    this.QuickPayForm.get('postalCode')?.markAsDirty();

    if (this.QuickPayForm.valid) {
      return true;
    }
    return false;
  }

  onSubmit() {
    if (this.validateFields()) {
      let accountNumber = this.QuickPayForm.get('accountNumber')?.value;
      if (this.isPostalCodeDisabled) {
        this.dataSharingService.IsLoadingEnabled.next(true);
        let invoiceNumber = this.QuickPayForm.get('invoiceNumber')?.value;
        this.getQuickPayData(
          accountNumber,
          invoiceNumber.replace(/ /g, ''),
          'invoiceNumber'
        );
      } else if (this.isInvoiceNumberDisabled) {
        this.dataSharingService.IsLoadingEnabled.next(true);
        let postalCode = this.QuickPayForm.get('postalCode')?.value;
        this.obppAuthService
          .unAuthCheckPostalCode(accountNumber, postalCode)
          .subscribe({
            next: (data) => {
              this.dataSharingService.IsLoadingEnabled.next(false);
              let errMsg = 'QUICK_PAY_ERROR';
              let tit = 'QUICK_PAY_TEXT';
              this.dataSharingService.IsLoadingEnabled.next(false);
              if (data.serviceResponse.type == 'success') {
                this.getQuickPayData(
                  accountNumber,
                  postalCode.replace(/ /g, ''),
                  'postalCode'
                );
              } else {
                this.openModal(tit, errMsg, 'OK', null, 'warning');
              }
            },
            error: (err) => {
              this.dataSharingService.IsLoadingEnabled.next(false);
            },
          });
      }
    }
  }

  disablePostalOrInvoice(type: string) {
    if (type === 'postal' && this.QuickPayForm.get('postalCode')?.value) {
      this.isPostalCodeDisabled = false;
      this.isInvoiceNumberDisabled = true;
    } else if (type === 'invoice' && this.QuickPayForm.get('invoiceNumber')?.value) {
      this.isPostalCodeDisabled = true;
      this.isInvoiceNumberDisabled = false;
    }else {
      this.isPostalCodeDisabled = false;
      this.isInvoiceNumberDisabled = false;
    }
  }

  openModal(
    title: string,
    errorMsg: string,
    firstButtonLabel: any,
    secondButtonLabel: any,
    modalType: string
  ) {
    const modalRef = this.modalService.open(OBPPModalDialogComponent);
    modalRef.componentInstance.my_modal_title = title;
    modalRef.componentInstance.my_modal_content = errorMsg;
    modalRef.componentInstance.firstButtonLabel = firstButtonLabel;
    modalRef.componentInstance.secondButtonLabel = secondButtonLabel;
    modalRef.componentInstance.modalType = modalType;
  }

  getQuickPayData(accountNumber: string, inv: string, type: string) {
    this.dataSharingService.IsLoadingEnabled.next(true);
    this.secAuditData = {
      accountNumber: accountNumber,
      attemptEntryPage: 'QuickPay',
      invoiceNumber: inv,
      postalCode: 'NULL',
      status: false,
      userEmailId: null,
    };
    let errMsg = 'QUICK_PAY_ERROR';
    let tit = 'QUICK_PAY_TEXT';
    this.obppQuickPayService
      .getAccountInfoByNumber(accountNumber, inv, type)
      .subscribe({
        next: (res) => {
          this.dataSharingService.IsLoadingEnabled.next(false);
          if (res.serviceResponse.type == 'success') {
            this.secAuditData.status = true;
            this.obppQuickPayService.quickPayData = res.serviceResponse;
            this.obppQuickPayService.selectedInvoice = inv;
            this.securityAuditService(this.secAuditData);
            this.route.navigateByUrl('/quickpay');
            this.dataSharingService.isRefreshRequired.next('quickpay');
          } else {
            this.secAuditData.status = false;
            this.securityAuditService(this.secAuditData);
            this.openModal(tit, errMsg, 'OK', null, 'warning');
          }
        },
        error: (e) => {
          this.dataSharingService.IsLoadingEnabled.next(false);
        },
      });
  }

  securityAuditService(data: any) {
    this.obppQuickPayService.getQuickPaySecurityAudit(data).subscribe({
      next: (res) => {
        console.log('Security Adit Log success');
      }
    });
  }
}

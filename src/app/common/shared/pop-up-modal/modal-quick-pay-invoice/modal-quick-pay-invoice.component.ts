import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { OBPPQuickPayService } from 'src/app/services/quick-pay/quick-pay.service';
import { QuickPaySecurityAudit } from 'src/app/models/new-user-registration.model';
import { Router } from '@angular/router';
import { OBPPModalDialogComponent } from 'src/app/components/error-component/modal-dialog/modal-dialog.component';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';

@Component({
  selector: 'modal-quick-pay-invoice',
  templateUrl: './modal-quick-pay-invoice.component.html',
  styleUrls: ['./modal-quick-pay-invoice.component.scss'],
})
export class OBPPQuickPayInvoiceComponent {
  @Input() my_modal_title: string = '';
  @Input() my_modal_content: string = '';
  @Input() firstButtonLabel: string = '';
  @Input() secondButtonLabel: string = '';
  @Input() modalType: string = '';
  @Input() accountNumber: any = [];
  @Output() successAction = new EventEmitter();
  @Output() cancelAction = new EventEmitter();

  isDuplicatePay: boolean = false;
  isLoading: boolean = false;
  secAuditData?: QuickPaySecurityAudit | any;

  QuickPayInvoiceForm!: FormGroup;
  userEmailID: string = '';
  isPostalCodeDisabled: boolean = false;
  isInvoiceNumberDisabled: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private obppQuickPayService: OBPPQuickPayService,
    private route: Router,
    private modalService: NgbModal,
    private obppAuthService: OBPPLoginService,
    private dataSharingService: DataSharingService,
  ) {
    this.QuickPayInvoiceForm = this.fb.group({
      accountNumber: ['', Validators.required],
      invoiceNumber: [''],
      postalCode: ['']
    });
  }

  successActionFunc() {
    this.checkDuplicateAccount();
    if (
      this.QuickPayInvoiceForm.valid &&
      this.QuickPayInvoiceForm.dirty &&
      this.validateFields() &&
      !this.isDuplicatePay
    ) {
      this.quickPayFunction();
    }
  }

  cancelActionFunc() {
    this.userEmailID = '';
    this.cancelAction.emit('');
    this.activeModal.close('Cancel');
  }

  checkDuplicateAccount() {
    this.isDuplicatePay = false;
    if (
      this.accountNumber.find(
        (a: any) => a == this.QuickPayInvoiceForm.get('accountNumber')?.value
      )
    ) {
      this.isDuplicatePay = true;
    }
  }

  validateFields() {
    this.QuickPayInvoiceForm.get('accountNumber')?.markAsDirty();
    this.QuickPayInvoiceForm.get('invoiceNumber')?.markAsDirty();
    if (this.QuickPayInvoiceForm.valid) {
      return true;
    }
    return false;
  }

  getQuickPayData(accountNumber: string, inv: string, type:string) {
    this.isLoading = true;
    this.secAuditData = {
      accountNumber: accountNumber,
      attemptEntryPage: 'QuickPay',
      invoiceNumber: inv,
      postalCode: 'NULL',
      status: false,
      userEmailId: null,
    };
    let errMsg = 'INVOICE_DOES_NOT_EXIST';
    let tit = 'PAY_FREIGHT_INTERNATIONAL_INVOICES';
    this.obppQuickPayService
      .getAccountInfoByNumber(accountNumber, inv.toLowerCase(), type)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.serviceResponse.type == 'success') {
            this.secAuditData.status = true;
            this.obppQuickPayService.quickPayData = res.serviceResponse;
            // this.obppQuickPayService.selectedInvoice = inv;
            if (res.serviceResponse.object.obppInvoices.length <= 0) {
              this.openModal(
                tit,
                'NO_OPEN_INVOICES_TEXT',
                null,
                'OK',
                'warning'
              );
            } else {
              this.successAction.emit(res.serviceResponse);
              this.activeModal.close('OK');
            }

            this.securityAuditService(this.secAuditData);
            //Route to the new page GRID
            this.route.navigateByUrl('/quickpay');
          } else {
            this.secAuditData.status = false;
            this.securityAuditService(this.secAuditData);
            this.openModal(tit, errMsg, null, 'OK', 'warning');
          }
        },
        error: (e) => {
          this.isLoading = false;
        },
      });
  }

  securityAuditService(data: any) {
    this.obppQuickPayService.getQuickPaySecurityAudit(data).subscribe({
      next: (res) => {
        console.log('Security Adit Log success');
      },
    });
  }

  disablePostalOrInvoice(type: string) {
    if (type === 'postal' && this.QuickPayInvoiceForm.get('postalCode')?.value) {
      this.isPostalCodeDisabled = false;
      this.isInvoiceNumberDisabled = true;
    } else if (type === 'invoice' && this.QuickPayInvoiceForm.get('invoiceNumber')?.value) {
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

  quickPayFunction() {
    this.dataSharingService.IsLoadingEnabled.next(true);
    if (this.validateFields()) {
      let accountNumber = this.QuickPayInvoiceForm.get('accountNumber')?.value;
      if (this.isPostalCodeDisabled) {
        let invoiceNumber = this.QuickPayInvoiceForm.get('invoiceNumber')?.value;
        this.getQuickPayData(
          accountNumber,
          invoiceNumber.replace(/ /g, ''),
          'invoiceNumber'
        );
        this.dataSharingService.IsLoadingEnabled.next(false);
      } else if (this.isInvoiceNumberDisabled) {
        let postalCode = this.QuickPayInvoiceForm.get('postalCode')?.value;
        this.obppAuthService
          .unAuthCheckPostalCode(accountNumber, postalCode)
          .subscribe({
            next: (data) => {
              this.dataSharingService.IsLoadingEnabled.next(false);
              let errMsg = 'QUICK_PAY_ERROR';
              let tit = 'QUICK_PAY_TEXT';
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
}

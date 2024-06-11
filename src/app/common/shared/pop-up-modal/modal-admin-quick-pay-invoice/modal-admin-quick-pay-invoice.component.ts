import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OBPPQuickPayService } from 'src/app/services/quick-pay/quick-pay.service';
import {
  QuickPaySecurityAudit,
  QuickPaySearchModel,
} from 'src/app/models/new-user-registration.model';
import { Router } from '@angular/router';
import { OBPPModalDialogComponent } from 'src/app/components/error-component/modal-dialog/modal-dialog.component';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';
import { OBPPAdminQuickPayService } from 'src/app/services/quick-pay/admin-quick-pay.service';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';

@Component({
  selector: 'modal-admin-quick-pay-invoice',
  templateUrl: './modal-admin-quick-pay-invoice.component.html',
  styleUrls: ['./modal-admin-quick-pay-invoice.component.scss'],
})
export class OBPPAdminQuickPayInvoiceComponent implements OnInit {
  @Input() my_modal_title: string = '';
  @Input() my_modal_content: string = '';
  @Input() my_model_additional_content: string = '';
  @Input() firstButtonLabel: string = '';
  @Input() secondButtonLabel: string = '';
  @Input() modalType: string = '';
  @Input() accountNumber: any = [];
  @Input()  invoiceNumber:any=[];
  @Output() successAction = new EventEmitter();
  @Output() cancelAction = new EventEmitter();

  @ViewChild('selectAllResult') selectAllResult: ElementRef | undefined;
  @ViewChild('selectOneResult') selectOneResult: ElementRef | undefined;

  isDuplicatePay: boolean = false;
  isLoading: boolean = false;
  secAuditData?: QuickPaySecurityAudit | any;
  errMsgFactory: any;
  searchResults: any = [];
  QuickPayInvoiceForm!: FormGroup;
  userEmailID: string = '';
  searchData?: QuickPaySearchModel | any;
  selectAllData: boolean = false;
  isSearchByInvoice:boolean=false;
  isSearchByAccount:boolean=false;
  p: number = 1;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private obppQuickPayService: OBPPQuickPayService,
    private obppAdminQuickPayService: OBPPAdminQuickPayService,
    private route: Router,
    private modalService: NgbModal,
    private obppAuthService: OBPPLoginService,
    private dataSharingService: DataSharingService,
    private router: Router,
  ) {
    this.QuickPayInvoiceForm = this.fb.group({
      accountNumber: '',
      invoiceNumber: '',
      accountName: '',
      phoneNumber: '',
      postalCode: '',
      city: '',
      streetName: '',
      streetNumber: '',
      billLanding: '',
    });
  }

  ngOnInit() {
    this.dataSharingService.isUserLoggedIn.subscribe((v) => {
      if (!v) {
        this.activeModal.dismiss('Error');
      } else if (
        this.obppAuthService.getUserDetails().serviceResponse.roleDto[
          'roleName'
        ] != 'Administrator'
      ) {
      }
    });
    this.isSearchByAccount=false;
    this.isSearchByInvoice=false;
  }

  selectAll(event: any): void {
    event.preventDefault(); 
    if (this.selectAllResult) {
      if(this.selectAllResult.nativeElement.checked==false){
        this.selectAllResults(true);
      }else if (this.selectAllResult.nativeElement.checked==true){
        this.selectAllResults(false)
      }
      this.selectAllResult.nativeElement.checked = !this.selectAllResult.nativeElement.checked;
    }
  }

  selectAccount(event:any,selected: any,accountNumber:any): void {
    event.preventDefault(); 
    if (this.selectOneResult) {
    // if(selected){
      this.searchResults.forEach((account:any) => {
        if(account.accountNumber===accountNumber){
          if(selected){
          account.selected=false;
          this.selectResult(false)
          }else if (!selected){
            account.selected=true;
            this.selectResult(true)
          }
        }
      });
    // }
      this.selectOneResult.nativeElement.checked = !this.selectOneResult.nativeElement.checked;
      
    }
  }

  clearSearchData() {
    this.searchData = {
      accountNumber: '',
      invoiceNumber: '',
      blNumber: '',
      accountName: '',
      postalCode: '',
      streetName: '',
      telephone: '',
      city: '',
      streetNumber: '',
      address: '',
      partialPostCode: '',
      accountNumbers: [],
      accountInfo: [],
      selectAll: false,
    };
  }

  isEmptySelection() {
    if (
      this.searchResults.length > 0 &&
      !this.searchResults.find((item: any) => item.selected)
    ) {
      return true;
    }

    return false;
  }

  clearResults() {
    this.searchResults = [];
    this.clearSearchData();
    this.selectAllData = false;
    this.isDuplicatePay = false;
  }

  clearFieldCol1() {
    this.QuickPayInvoiceForm.get('accountNumber')?.setValue('');
    this.QuickPayInvoiceForm.get('invoiceNumber')?.setValue('');
    this.p = 1;
    this.clearResults();
  }

  clearFieldCol2() {
    this.QuickPayInvoiceForm.get('accountName')?.setValue('');
    this.QuickPayInvoiceForm.get('postalCode')?.setValue('');
    this.QuickPayInvoiceForm.get('phoneNumber')?.setValue('');
    this.QuickPayInvoiceForm.get('streetName')?.setValue('');
    this.QuickPayInvoiceForm.get('streetNumber')?.setValue('');
    this.QuickPayInvoiceForm.get('city')?.setValue('');
    this.p = 1;
    this.clearResults();
  }

  clearFieldCol3() {
    this.QuickPayInvoiceForm.get('billLanding')?.setValue('');
    this.p = 1;
    this.clearResults();
  }

  clearFields() {
    this.QuickPayInvoiceForm.get('accountNumber')?.setValue('');
    this.QuickPayInvoiceForm.get('invoiceNumber')?.setValue('');
    this.QuickPayInvoiceForm.get('accountName')?.setValue('');
    this.QuickPayInvoiceForm.get('postalCode')?.setValue('');
    this.QuickPayInvoiceForm.get('phoneNumber')?.setValue('');
    this.QuickPayInvoiceForm.get('streetName')?.setValue('');
    this.QuickPayInvoiceForm.get('streetNumber')?.setValue('');
    this.QuickPayInvoiceForm.get('city')?.setValue('');
    this.QuickPayInvoiceForm.get('billLanding')?.setValue('');
    this.p = 1;
  }

  seachByAccountOrInvoice() {
    this.clearFieldCol2();
    this.clearFieldCol3();
    this.searchData = {
      accountNumber: this.QuickPayInvoiceForm.get('accountNumber')?.value,
      invoiceNumber: this.QuickPayInvoiceForm.get('invoiceNumber')?.value,
      blNumber: '',
      accountName: '',
      postalCode: '',
      streetName: '',
      telephone: '',
      city: '',
      streetNumber: '',
      address: '',
      partialPostCode: '',
      accountNumbers: [],
      accountInfo: [],
      selectAll: false,
    };
    this.dataSharingService.IsLoadingEnabled.next(true);
    this.obppAdminQuickPayService
      .searchByAccountOrInvoice(this.searchData)
      .subscribe({
        next: (res) => {
          if (res.serviceResponse.type == 'success') {
            if (res.serviceResponse.object != null) {
              if (
                res.serviceResponse.object.length > 0 &&
                res.serviceResponse.object[0].accountNumber != '' &&
                res.serviceResponse.object[0].accountNumber != null
              ) {
                this.searchResults = res.serviceResponse.object;
                this.searchResults.forEach((el: any) => {
                  el['selected'] = true;
                });
              }
            }
          }
          if (this.searchResults.length > 0) {
            this.selectAllData = true;
          }
          this.isSearchByAccount=true;
          this.dataSharingService.IsLoadingEnabled.next(false);
        },
        error: (error) => {
          this.dataSharingService.IsLoadingEnabled.next(false);
        },
      });
  }

  seachByAccountsInfo() {
    this.clearFieldCol1();
    this.clearFieldCol3();
    this.searchData = {
      accountNumber: '',
      invoiceNumber: '',
      blNumber: '',
      accountName: this.QuickPayInvoiceForm.get('accountName')?.value,
      postalCode: this.QuickPayInvoiceForm.get('postalCode')?.value,
      streetName: this.QuickPayInvoiceForm.get('streetName')?.value,
      telephone: this.QuickPayInvoiceForm.get('phoneNumber')?.value,
      city: this.QuickPayInvoiceForm.get('city')?.value,
      streetNumber: this.QuickPayInvoiceForm.get('streetNumber')?.value,
      address: '',
      partialPostCode: this.QuickPayInvoiceForm.get('postalCode')?.value,
      accountNumbers: [],
      accountInfo: [],
      selectAll: false,
    };

    this.dataSharingService.IsLoadingEnabled.next(true);

    this.obppAdminQuickPayService
      .searchByAccountNameOrAddress(this.searchData)
      .subscribe({
        next: (res) => {
          if (res.serviceResponse.type == 'success') {
            if (res.serviceResponse.object != null) {
              if (
                res.serviceResponse.object.length > 0 &&
                res.serviceResponse.object[0].accountNumber != '' &&
                res.serviceResponse.object[0].accountNumber != null
              ) {
                this.searchResults = res.serviceResponse.object;
                this.searchResults.forEach((el: any) => {
                  el['selected'] = false;
                });
              }
            }
          }
          this.isSearchByInvoice=true;
          this.dataSharingService.IsLoadingEnabled.next(false);
        },
        error: (error) => {
          this.dataSharingService.IsLoadingEnabled.next(false);
        },
      });
  }

  seachByBOL() {
    this.clearFieldCol1();
    this.clearFieldCol2();
    this.searchData = {
      accountNumber: '',
      invoiceNumber: '',
      blNumber: this.QuickPayInvoiceForm.get('billLanding')?.value,
      accountName: '',
      postalCode: '',
      streetName: '',
      telephone: '',
      city: '',
      streetNumber: '',
      address: '',
      partialPostCode: '',
      accountNumbers: [],
      accountInfo: [],
      selectAll: false,
    };
    this.dataSharingService.IsLoadingEnabled.next(true);
    this.obppAdminQuickPayService
      .searchByBillOfLading(this.searchData)
      .subscribe({
        next: (res) => {
          if (res.serviceResponse.type == 'success') {
            if (res.serviceResponse.object != null) {
              if (
                res.serviceResponse.object.length > 0 &&
                res.serviceResponse.object[0].accountNumber != '' &&
                res.serviceResponse.object[0].accountNumber != null
              ) {
                this.searchResults = res.serviceResponse.object;
                this.searchResults.forEach((el: any) => {
                  el['selected'] = false;
                });
              }
            }
          }
          this.dataSharingService.IsLoadingEnabled.next(false);
        },
        error: (error) => {
          this.dataSharingService.IsLoadingEnabled.next(false);
        },
      });
  }

  successActionFunc() {
    this.checkDuplicateAccount();
    if (
      this.searchResults.length > 0 &&
      !this.isDuplicatePay &&
      !this.isEmptySelection()
    ) {
      this.quickPayFunction();
    }
  }

  selectAllResults(v: any) {
    if (v) {
      this.searchResults.forEach((item: any) => {
        item.selected = true;
      });
    } else {
      this.searchResults.forEach((item: any) => {
        item.selected = false;
        this.isDuplicatePay=false;
      });
    }
  }

  selectResult(v: any) {
    if (v && !this.searchResults.find((item: any) => !item.selected)) {
      this.selectAllData = true;
    } else {
      this.selectAllData = false;
      this.isDuplicatePay=false;
    }
  }

  cancelActionFunc() {
    this.userEmailID = '';
    this.cancelAction.emit('');
    this.activeModal.close('Cancel');
  }

  checkDuplicateAccount() {
    this.isDuplicatePay = false;
    if(this.isSearchByAccount){
    if (
      this.invoiceNumber.find((a: any) =>
        this.searchResults.find(
          (it: any) => it.accountNumber == a && it.selected
        )
      )
    ) {
      this.isDuplicatePay = true;
    }
    
  }
  if(this.isSearchByInvoice){
    if (
      this.invoiceNumber.find((a: any) =>
        this.searchResults.find(
          (it: any) => it.accountNumber == a && it.selected
        )
      )
    ) {
      this.isDuplicatePay = true;
    }
  }
  }

  getQuickPayData(accountNumber: string, inv: string) {
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
      .getAccountInfoByNumber(accountNumber, inv.toLowerCase(), 'postalCode')
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.serviceResponse.type == 'success') {
            this.secAuditData.status = true;
            this.obppQuickPayService.quickPayData = res.serviceResponse;
            if (res.serviceResponse.object.obppInvoices.length <= 0) {
              this.openModal(
                tit,
                'NO_OPEN_INVOICES_TEXT',
                null,
                'NO',
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
            this.openModal(tit, errMsg, null, 'NO', 'warning');
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
        console.log('Security Log success');
      }
    });
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
    this.searchData.accountNumbers = [];
    this.searchData.accountInfo = [];
    this.searchResults.forEach((item: any) => {
      if (item.selected) {
        this.searchData.accountInfo.push(
          item.accountNumber.toString() + ':' + item.accountType
        );
        this.searchData.accountNumbers.push(item.accountNumber.toString());
      }
    });
    this.obppAdminQuickPayService
      .getAccountSummaryFromAccountNumbers(this.searchData)
      .subscribe({
        next: (data) => {
          this.dataSharingService.IsLoadingEnabled.next(false);
          if (data.serviceResponse.type == 'success') {
            if (data.serviceResponse.object.accountList && data.serviceResponse.object.accountList.length > 0) {
              let accountNumbers = [];
              accountNumbers = data.serviceResponse.object.accountList.filter((account: any) => account.invoicesCount <= 0).map((account: any) => account.accountNumber);
              if (accountNumbers.length > 0){
                const modalRef = this.modalService.open(
                  OBPPModalDialogComponent
                );
                modalRef.componentInstance.my_modal_content =
                  'NO_OUTSTANDINGOPEN_INVOICE';
                modalRef.componentInstance.my_model_additional_content = accountNumbers;
                modalRef.componentInstance.firstButtonLabel = 'EFT_GUIDELINES_CLOSE';
                modalRef.componentInstance.modalType = 'warning';
                }
            }
            this.successAction.emit(data.serviceResponse);
            this.activeModal.close('OK');
          }
        },
        error: (err) => {
          this.dataSharingService.IsLoadingEnabled.next(false);
        },
      });
  }
}

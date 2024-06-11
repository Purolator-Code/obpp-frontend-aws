import {
  Component,
  OnInit,
  QueryList,
  ViewChildren,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
import {
  NgbdSortableHeader,
  SortEvent,
} from 'src/app/common/bootstrap-sortable-header/sortable-header.directive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OBPPModalDialogComponent } from '../../error-component/modal-dialog/modal-dialog.component';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { OBPPAdminQuickPayInvoiceComponent } from 'src/app/common/shared/pop-up-modal/modal-admin-quick-pay-invoice/modal-admin-quick-pay-invoice.component';
import { OBPPQuickPayCPWAService } from 'src/app/services/cpwa-services/quickpay-cpwa.services';
import { CPWAQuickPayData } from 'src/app/models/obpp-invoice.model';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';
import { LocalStorageService } from 'src/app/services/global/local-storage.service';
import { OBPPAdminQuickPayService } from 'src/app/services/quick-pay/admin-quick-pay.service';
import { TranslateService } from '@ngx-translate/core';

const compare = (v1: string | number, v2: string | number) =>
  v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

@Component({
  selector: 'obpp-admin-quick-payment',
  templateUrl: './obpp-admin-quick-payment.component.html',
  styleUrls: ['./obpp-admin-quick-payment.component.scss'],
})
export class OBPPAdminQuickPayment implements OnInit {
  @ViewChildren(NgbdSortableHeader) headers?: QueryList<NgbdSortableHeader>;
  @ViewChild('init__payment') init__payment!: ElementRef;

  @ViewChild('checkAllInoices') checkAllInoices: ElementRef | undefined;
  @ViewChild('selectInvoice') selectInvoice: ElementRef | undefined;

  @ViewChild('cad')
  cad!: ElementRef;

  @ViewChild('usd')
  usd!: ElementRef;
  accountName: any;

  content?: string;
  cpwaPayload: any;

  FromEmployeeCSR: boolean = false;
  paymentSuccessFlag: boolean = false;
  showQuickPay: boolean = false;
  paymentInfo: string = ''; // will be deleted
  showIFrame: boolean = false;
  isCancelClicked: boolean = false;
  declinedMessage: boolean = false;
  amountInvalidFlag: boolean = false;

  invoiceLength = 0;
  cadInvoiceCount = 0;
  usdInvoiceCount = 0;
  paymentAmount = 0;
  fieldErrorsObj = [];
  QuickPaymentForm: FormGroup;
  errMsgFactory: any;

  quickPaymentData: any = [];
  invoiceList: any = [];
  allInvoiceList: any = [];
  invoiceListGrid: any = [];
  selectedInvoice: string = '';

  cpwaQuickPayData!: CPWAQuickPayData;
  paymentInformation: any = [];
  paymentURL = '';
  checkAllInvoices: boolean = false;
  unappliedAccountNumber: string = '';
  unAppliedPayAmount: string = '';
  isAccountNumberError: boolean = false;
  isAccountNumberNotExist: boolean = false;
  isPayAmountError: boolean = false;
  paymentCurrency: string = 'CAD';
  cadTotal: number = 0;
  selectNext: boolean = false;
  usdTotal: number = 0;
  paymentDate: any;

  constructor(
    private dataSharingService: DataSharingService,
    private obppLoginService: OBPPLoginService,
    private modalService: NgbModal,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private obppQuickPayCPWAService: OBPPQuickPayCPWAService,
    private obppAdminQuickPayService: OBPPAdminQuickPayService,
    public locstore: LocalStorageService,
    private translate: TranslateService
  ) {
    this.QuickPaymentForm = this.fb.group({
      invoiceType: ['', Validators.required],
      accountNumbers: '',
      invoiceNumbers: ['', Validators.required],
      paymentAmount: ['', Validators.required],
      emailAddress: [
        '',
        Validators.pattern(
          '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,7}$'
        ),
      ],
    });
    this.paymentURL = this.obppLoginService.getCPWAPaymentURL();
  }

  ngOnInit() {
    this.showQuickPay = true;
    this.quickPaymentData = [];
    this.selectedInvoice = '';
    this.paymentSuccessFlag = false;
    this.showIFrame = false;
    this.declinedMessage = false;
    this.paymentCurrency = 'CAD';
    this.popUpQuickPay();
    if (this.quickPaymentData?.object?.invoices) {
      this.invoiceList = this.quickPaymentData?.object?.invoices;
      this.paymentAmount = 0;
      this.invoiceLength = 0;
      this.invoiceList.forEach((item: any) => {
        item.isChecked = false;
        item.paymentAmount = 0;
        if (this.selectedInvoice == item.invoiceNumber) {
          item.isChecked = true;
          item.paymentAmount = parseFloat(item.balanceDue);
          this.paymentAmount += parseFloat(item.balanceDue);
          this.invoiceLength++;
        } else {
          item.paymentAmount = 0;
        }
      });
      this.allInvoiceList = this.cloneObject(this.invoiceList);
    } else {
      this.invoiceList = [];
      this.allInvoiceList = [];
      this.invoiceLength = 0;
      this.paymentAmount = 0;
    }
  }

  cloneObject(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers?.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    // sorting countries
    if (direction || column) {
      this.invoiceList = [...this.invoiceList].sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }

  cancelConfirmation() {
    let tit = 'CONFIRMATION';
    let errMsg = 'QUICK_PAY_CANCEL_TEXT_CONFIRMATION';
    this.openModal(tit, errMsg, 'YES', 'NO', 'warning');
  }

  loadIFrame() {
    this.openCPWAQuickPayGateway();
  }

  popUpQuickPay() {
    this.openQuickPayPopup(
      'QUICK_PAY_TEXT',
      '',
      'CONTINUE_TEXT',
      'CANCEL_TEXT',
      'warning'
    );
  }

  payAnotherInvoiceAfterPayment() {
    this.ngOnInit();
    this.QuickPaymentForm.get('emailAddress')?.setValue('');
  }

  registerforBilling() {
    this.router.navigateByUrl('/register');
  }

  payAnotherInvoice() {
    this.router.navigateByUrl('/manageusers');
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

    modalRef.componentInstance.successAction.subscribe(($e: any) => {
      this.returnToHome();
    });
  }

  returnToHome() {
    this.router.navigateByUrl('/manageusers');
    this.dataSharingService.activeIdString.next('/manageusers');
  }

  openQuickPayPopup(
    title: string,
    errorMsg: string,
    firstButtonLabel: any,
    secondButtonLabel: any,
    modalType: string
  ) {
    const modalRef = this.modalService.open(OBPPAdminQuickPayInvoiceComponent, {
      size: 'xl',
    });
    modalRef.componentInstance.my_modal_title = title;
    modalRef.componentInstance.my_modal_content = errorMsg;
    modalRef.componentInstance.firstButtonLabel = firstButtonLabel;
    modalRef.componentInstance.secondButtonLabel = secondButtonLabel;
    modalRef.componentInstance.modalType = modalType;
    modalRef.componentInstance.accountNumber = this.allInvoiceList.map(
      (item: any) => item.invoiceNumber
    );
    modalRef.componentInstance.invoiceNumber = this.allInvoiceList.map(
      (item: any) => item.accountNumber
      
    );

    modalRef.componentInstance.successAction.subscribe((newList: any) => {
      if (newList?.object?.accountList?.length > 0) {
        newList.object.accountList.forEach((account: any) => {
          if (account.invoices?.length > 0) {
            let invoices = account.invoices;
            invoices.forEach((inv: any) => {
              inv.isChecked = false;
              inv.paymentAmount = 0;
            });
            this.allInvoiceList.push(...invoices);
            this.invoiceList.push(...invoices);
          }
        });
      }
      this.checkAllInvoices = false;
    });
  }

  searchFunc() {
    this.invoiceList = this.cloneObject(this.allInvoiceList);
  }

  updatePaymentAmount(event: any) {
    this.invoiceLength = 0;
    this.paymentAmount = 0;
    this.invoiceList.forEach((item: any) => {
      item.paymentAmount =
        item.paymentAmount == '' || item.paymentAmount === null
          ? 0
          : item.paymentAmount;
      if (item.isChecked) {
        this.paymentAmount += parseFloat(item.paymentAmount);
        this.invoiceLength++;
      }
    });
  }

  updatePaymentAmountFromSelect(event: any, i: any) {
    this.invoiceLength = 0;
    this.paymentAmount = 0;
    if (this.invoiceList[i].isChecked) {
      this.invoiceList[i].paymentAmount = this.invoiceList[i].balanceDue;
    } else {
      this.checkAllInvoices = false;
      this.invoiceList[i].paymentAmount = 0;
    }
    this.invoiceList.forEach((item: any) => {
      item.paymentAmount =
        item.paymentAmount == '' || item.paymentAmount === null
          ? 0
          : item.paymentAmount;
      if (item.isChecked) {
        this.paymentAmount += parseFloat(item.paymentAmount);
        this.invoiceLength++;
      }
    });
    if (this.invoiceLength === this.invoiceList.length) {
      this.checkAllInvoices = true;
      this.selectNext = false;
    } else if (this.invoiceLength === 0) {
      this.selectNext = true;
    } else {
      this.selectNext = false;
    }
  }

  checkAllInvoice(event:any){
    event.preventDefault();
    if(this.checkAllInoices){
      if(this.checkAllInoices.nativeElement.checked==true){
        this.checkAllInvoices=false;
        this.selctAllInvoices(event);
      }else if(this.checkAllInoices.nativeElement.checked==false){
        this.checkAllInvoices=true;
        this.selctAllInvoices(event);
      }
    this.checkAllInoices.nativeElement.checked = !this.checkAllInoices.nativeElement.checked;
    }
    
  }
  checkOneInvoice(event:any,index:any,invoiceNumber:any,isChecked:any){
    event.preventDefault();
    if(this.selectInvoice){
      this.invoiceList.forEach((invoice:any)=>{
          if(invoice.invoiceNumber===invoiceNumber){
            if(isChecked){
            invoice.isChecked=false;
            this.updatePaymentAmountFromSelect(event,index);
            }else if (!isChecked){
              invoice.isChecked=true;
              this.updatePaymentAmountFromSelect(event,index);
            }
          }
      })
    this.selectInvoice.nativeElement.checked = !this.selectInvoice.nativeElement.checked;
    }
    
  }

  selctAllInvoices(event: any) {
    this.invoiceLength = 0;
    this.paymentAmount = 0;

    this.invoiceList.forEach((item: any) => {
      if (this.checkAllInvoices) {
        item.isChecked = true;
        if (parseFloat(item.paymentAmount) <= 0) {
          item.paymentAmount = parseFloat(item.balanceDue);
        }
        this.invoiceLength++;
        this.paymentAmount += parseFloat(item.paymentAmount);
      } else {
        item.isChecked = false;
        item.paymentAmount = 0;
        this.invoiceLength = 0;
        this.paymentAmount = 0;
      }
    });
    if (this.checkAllInvoices) {
      this.selectNext = false;
    } else if (!this.checkAllInvoices) {
      this.selectNext = true;
    }
  }

  updateOnlyAmount() {
    this.invoiceList.forEach((item: any) => {
      item.paymentAmount =
        item.paymentAmount == '' || item.paymentAmount === null
          ? 0
          : item.paymentAmount;
      if (
        parseFloat(item.paymentAmount) > parseFloat(item.balanceDue) &&
        item.invoiceNumber != '888888888'
      ) {
        item.paymentAmount = 0;
      }
    });
  }

  openCPWAQuickPayGateway() {
    this.isCancelClicked = false;
    if (this.invoiceLength > 0 && this.paymentAmount > 0) {
      let x: any = [];
      this.invoiceList.forEach((item: any) => {
        if (item.isChecked) {
          x.push({
            paymentCurrency: this.paymentCurrency,
            invoiceCurrency: item.invoiceCurrency,
            accountName: item.accountName,
            accountNumber: item.accountNumber,
            balanceDue: item.balanceDue,
            dueDate: Date.parse(item.dueDate),
            invoiceAmount: parseFloat(item.paymentAmount),
            invoiceDate: Date.parse(item.invoiceDate),
            invoiceNumber: item.invoiceNumber,
            note: null,
            payAmount: parseFloat(item.paymentAmount),
            paymentAmount: parseFloat(item.paymentAmount),
          });
        }
      });
      this.cpwaQuickPayData = {
        paymentCurrency: this.paymentCurrency,
        createMethod: 'QuickPay-E',
        invoiceList: x,
        paymentType: 'Credit Card',
        totalPayAmount: this.paymentAmount,
        additionalEmailId: this.QuickPaymentForm.get('emailAddress')?.value,
      };
      this.dataSharingService.IsLoadingEnabled.next(true);
      this.obppQuickPayCPWAService
        .getQuickPayCPWAPayment(this.cpwaQuickPayData)
        .subscribe(
          (res: any) => {
            this.showIFrame = true;
            this.cpwaPayload = res.serviceResponse.object;

            this.paymentURL = this.obppLoginService.getCPWAPaymentURL();

            this.dataSharingService.IsLoadingEnabled.next(false);
            setTimeout(() => {
              this.init__payment.nativeElement.submit();
            }, 200);
          },
          (error) => {
            this.dataSharingService.IsLoadingEnabled.next(false);
          }
        );
    } else {
      let errMsg =
        this.invoiceList.length > 0
          ? 'INVALID_PAY_AMOUNT_TEXT'
          : 'NO_OPEN_INVOICES_TEXT';
      let tit = 'QUICK_PAY_TEXT';
      this.openModal(tit, errMsg, null, 'OK', 'warning');
    }
  }

  parseDateToLang(d: string) {
    let year = parseInt(d.substring(0, 4));
    let mon = parseInt(d.substring(4, 6)) - 1;
    let day = parseInt(d.substring(6, 8));
    let hr = parseInt(d.substring(8, 10));
    let min = parseInt(d.substring(10, 12));
    let sec = parseInt(d.substring(12));

    let dt = new Date(year, mon, day, hr, min, sec);

    return dt;
  }

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent): void {
    this.isCancelClicked = false;
    if (event.data.event === 'cpwaProcessing') {
      this.dataSharingService.isPaymentInProgress.next(true);
    }

    if (event.data.event === 'cpwaProcessed') {
      this.dataSharingService.isPaymentInProgress.next(false);
    }

    if (event.data.event === 'cpwaCommit') {
      let payload;
      let property: keyof typeof event.data;
      for (property in event.data) {
        if (property === 'payload') {
          payload = event.data[property];
        }
      }

      let quickPaySumitpayment = {
        paymentCurrency: this.paymentCurrency,
        createMethod: this.cpwaQuickPayData.createMethod,
        additionalEmailId: this.cpwaQuickPayData.additionalEmailId,
        encryptedPayload: this.cpwaPayload,
        encryptedPaymentResult: payload,
        paymentType: this.cpwaQuickPayData.paymentType,
        totalPayAmount: this.cpwaQuickPayData.totalPayAmount,
        invoiceList: this.cpwaQuickPayData.invoiceList,
      };

      this.obppQuickPayCPWAService
        .submitPaymentToCpwa(quickPaySumitpayment)
        .subscribe((paymentres: any) => {
          this.paymentInfo = '';
          this.paymentInformation = [];
          if (paymentres['serviceResponse']['type'] == 'success') {
            this.paymentInformation = paymentres['serviceResponse']['object'];
            this.showIFrame = false;
            this.showQuickPay = false;
            this.paymentSuccessFlag = true;
            let paymentDate = this.paymentInformation?.paymentDateTime.slice(
              0,
              8
            );
            const year = paymentDate.slice(0, 4);
            const month = paymentDate.slice(4, 6);
            const date = paymentDate.slice(6, 8);
            paymentDate = new Date(year, month - 1, date);
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            this.paymentDate = paymentDate.toLocaleDateString('en-US', {
              timezone: timezone,
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            });
          } else {
            this.isCancelClicked = true;
            this.showIFrame = false;
            this.showQuickPay = true;
          }
        });
    }
  }

  printPage() {
    let css = '@page { size: landscape; }',
      head = document.head || document.getElementsByTagName('head')[0],
      style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.media = 'print';
    style.appendChild(document.createTextNode(css));
    head.appendChild(style);
    window.print();
  }

  validateUnAppliedData() {
    this.isPayAmountError = false;
    this.isAccountNumberError = false;
    if (this.unappliedAccountNumber == '') {
      this.isAccountNumberError = true;
    } else if (this.unAppliedPayAmount == '') {
      this.isPayAmountError = true;
    }
  }

  addUnappliedAccount() {
    this.isAccountNumberNotExist = false;
    this.validateUnAppliedData();
    if (!this.isPayAmountError && !this.isAccountNumberError) {
      this.dataSharingService.IsLoadingEnabled.next(true);
      this.isAccountNumberError = false;
      let totalPaymentAmount = 0;
      this.obppAdminQuickPayService
        .searchByAccountOrInvoice({
          accountNumber: this.unappliedAccountNumber,
        })
        .subscribe(
          (res) => {
            if (res.serviceResponse.type == 'success') {
              res.serviceResponse.object.forEach((item: any) => {
                if (item.accountNumber != null && item.accountNumber != '') {
                  item.invoiceAmount = 0;
                  item.balanceDue = parseFloat(this.unAppliedPayAmount);
                  item.paymentAmount = parseFloat(this.unAppliedPayAmount);
                  item.payAmount = parseFloat(this.unAppliedPayAmount);
                  item.invoiceNumber = '888888888';
                  item.invoiceCurrency = this.paymentCurrency;
                  item.isChecked = true;

                  totalPaymentAmount += item.paymentAmount;
                  this.allInvoiceList.push(item);
                  this.searchFunc();
                } else {
                  this.isAccountNumberNotExist = true;
                }
              });
              this.updatePaymentAmount(totalPaymentAmount);
            } else {
              this.isAccountNumberError = true;
            }
            this.unAppliedPayAmount = '';
            this.unappliedAccountNumber = '';
            this.dataSharingService.IsLoadingEnabled.next(false);
          },
          (error) => {
            this.isAccountNumberError = true;
            this.dataSharingService.IsLoadingEnabled.next(false);
          }
        );
    }
  }

  clearResultsFromUnapplied() {
    this.unAppliedPayAmount = '';
    this.unappliedAccountNumber = '';
  }

  setPaymentCurrency(paymentType: string) {
    if (paymentType === 'cad') {
      this.cad.nativeElement.checked = true;
      this.paymentCurrency = 'CAD';
      if (this.cadTotal === 0) {
        this.selectNext = true;
      } else {
        this.selectNext = false;
      }
    } else if (paymentType === 'usd') {
      this.usd.nativeElement.checked = true;
      this.paymentCurrency = 'USD';
      if (this.usdTotal === 0) {
        this.selectNext = true;
      } else {
        this.selectNext = false;
      }
    }
  }

  getSelectedCADTotal() {
    let tot = 0;
    let count = 0;
    this.invoiceList.forEach((item: any) => {
        if (item.invoiceCurrency === 'CAD' && item.isChecked) {
            count++;
            tot += item.balanceDue ? parseFloat(item.paymentAmount) : 0;
        }
    });
    this.cadTotal = tot;
    this.cadInvoiceCount = count;
    return tot;
  }

  getSelectedUSDTotal() {
    let tot = 0;
    let count = 0;
    this.invoiceList.forEach((item: any) => {
        if (item.invoiceCurrency === 'USD' && item.isChecked) {
            count++;
            tot += item.balanceDue ? parseFloat(item.paymentAmount) : 0;
        }
    });
    this.usdTotal = tot;
    this.usdInvoiceCount = count;
    return tot;
  }

  enableNext() {
    let invoice = this.invoiceList.filter(
      (invoice: { isChecked: boolean }) => invoice.isChecked == true
    );
    if (this.isCancelClicked && invoice.length == 0) {
      return true;
    } else {
      if (this.paymentCurrency == 'CAD' && this.cadTotal === 0) {
        return true;
      } else if (this.paymentCurrency == 'USD' && this.usdTotal === 0) {
        return true;
      } else {
        return false;
      }
    }
  }
}

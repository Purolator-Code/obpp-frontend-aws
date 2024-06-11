import {
  Component,
  OnInit,
  QueryList,
  ViewChildren,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
import { OBPPQuickPayService } from 'src/app/services/quick-pay/quick-pay.service';
import {
  NgbdSortableHeader,
  SortEvent,
} from 'src/app/common/bootstrap-sortable-header/sortable-header.directive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OBPPModalDialogComponent } from '../../error-component/modal-dialog/modal-dialog.component';
import { Router } from '@angular/router';
import { OBPPQuickPayInvoiceComponent } from 'src/app/common/shared/pop-up-modal/modal-quick-pay-invoice/modal-quick-pay-invoice.component';
import { OBPPQuickPayCPWAService } from 'src/app/services/cpwa-services/quickpay-cpwa.services';
import { CPWAQuickPayData } from 'src/app/models/obpp-invoice.model';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';
import { LocalStorageService } from 'src/app/services/global/local-storage.service';

const compare = (v1: string | number, v2: string | number) =>
  v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

@Component({
  selector: 'obpp-quick-payment',
  templateUrl: './obpp-quick-payment.component.html',
  styleUrls: ['./obpp-quick-payment.component.scss'],
})
export class OBPPQuickPayment implements OnInit {
  @ViewChildren(NgbdSortableHeader) headers?: QueryList<NgbdSortableHeader>;
  @ViewChild('init__payment') init__payment!: ElementRef;
  @ViewChild('checkAllInvoice') checkAllInvoice: ElementRef | undefined;
  @ViewChild('checkInvoice') checkInvoice: ElementRef | undefined;
  content?: string;
  cpwaPayload: any;

  FromEmployeeCSR: boolean = false;
  paymentSuccessFlag: boolean = false;
  showQuickPay: boolean = false;
  paymentInfo: string = ''; // will be deleted
  showIFrame: boolean = false;
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

  paymentCurrency: string = 'CAD';

  @ViewChild('cad')
  cad!: ElementRef;

  @ViewChild('usd')
  usd!: ElementRef;
  cadTotal: number = 0;
  usdTotal: number = 0;
  selectNext: boolean = true;
  paymentDate: any;

  constructor(
    private dataSharingService: DataSharingService,
    private obppLoginService: OBPPLoginService,
    private modalService: NgbModal,
    private router: Router,
    private fb: FormBuilder,
    private obppQuickPayService: OBPPQuickPayService,
    private obppQuickPayCPWAService: OBPPQuickPayCPWAService,
    public locstore: LocalStorageService
  ) {
    this.QuickPaymentForm = this.fb.group({
      invoiceType: ['', Validators.required],
      accountNumbers: '',
      invoiceNumbers: ['', Validators.required],
      paymentAmount: ['', Validators.required],
      emailAddress: [
        '',
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,7}$'),
      ],
    });
    this.paymentURL = this.obppLoginService.getCPWAPaymentURL();
  }

  ngOnInit() {
    this.showQuickPay = true;
    this.quickPaymentData = this.obppQuickPayService.getQuickPayData();
    this.selectedInvoice = this.obppQuickPayService.getSelectedInvoice();
    this.paymentCurrency = 'CAD';
    if (this.quickPaymentData?.object?.obppInvoices) {
      this.invoiceList = this.quickPaymentData?.object?.obppInvoices;
      this.paymentAmount = 0;
      this.invoiceLength = 0;
      this.paymentCurrency = this.invoiceList[0].invoiceCurrency;
      this.invoiceList.forEach((item: any) => {
        item.isChecked = false;
        item.paymentAmount = 0;
        item.paymentCurrency = item.invoiceCurrency;
        if (this.selectedInvoice == item.invoiceNumber) {
          this.selectNext = false
          this.paymentCurrency = item.invoiceCurrency;
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

  checkAllInvoiceList(event: any): void {
    event.preventDefault(); 
    if (this.checkAllInvoice) {
      if(this.checkAllInvoice.nativeElement.checked){
        this.checkAllInvoices=false
        this.selctAllInvoices(event);
      }else if (!this.checkAllInvoice.nativeElement.checked){
       this.checkAllInvoices=true;
        this.selctAllInvoices(event);
      }
      this.checkAllInvoice.nativeElement.checked = !this.checkAllInvoice.nativeElement.checked;
      
    }
  }
  checkInvoices(event:any,isChecked:any,accountNumber:any,index:any){
    event.preventDefault(); 
    if (this.checkInvoice) {
      if(this.checkInvoice.nativeElement.checked){
        this.invoiceList[index].isChecked=false
       
      }else if (!this.checkInvoice.nativeElement.checked){
        this.invoiceList[index].isChecked=true
        //this.updatePaymentAmountFromSelect(event,index);
      }
      this.updatePaymentAmountFromSelect(event,index);
      this.checkInvoice.nativeElement.checked = !this.checkInvoice.nativeElement.checked;
      
    }
  }


  searchFunc() {
    if (this.paymentCurrency == 'CAD') {
      this.invoiceList = this.cloneObject(
        this.allInvoiceList.filter((item: any) => item.invoiceCurrency == 'CAD')
      );
    } else if (this.paymentCurrency == 'USD') {
      this.invoiceList = this.cloneObject(
        this.allInvoiceList.filter((item: any) => item.invoiceCurrency == 'USD')
      );
    } else {
      this.invoiceList = this.cloneObject(
        this.allInvoiceList.filter((item: any) => !item.invoiceCurrency)
      );
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
    this.router.navigateByUrl('/home');
  }

  registerforBilling() {
    this.router.navigateByUrl('/register');
  }

  payAnotherInvoice() {
    this.router.navigateByUrl('/home');
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
    this.router.navigateByUrl('/home');
    this.dataSharingService.isRefreshRequired.next('home');
  }

  openQuickPayPopup(
    title: string,
    errorMsg: string,
    firstButtonLabel: any,
    secondButtonLabel: any,
    modalType: string
  ) {
    const modalRef = this.modalService.open(OBPPQuickPayInvoiceComponent);
    modalRef.componentInstance.my_modal_title = title;
    modalRef.componentInstance.my_modal_content = errorMsg;
    modalRef.componentInstance.firstButtonLabel = firstButtonLabel;
    modalRef.componentInstance.secondButtonLabel = secondButtonLabel;
    modalRef.componentInstance.modalType = modalType;
    modalRef.componentInstance.accountNumber = this.allInvoiceList.map(
      (item: any) => item.accountNumber
    );

    modalRef.componentInstance.successAction.subscribe((newList: any) => {
      if (newList?.object?.obppInvoices?.length > 0) {
        newList.object.obppInvoices.forEach((inv1: any) => {
          inv1.isChecked = false;
          inv1.paymentAmount = 0;
        });
        this.allInvoiceList.push(...newList.object.obppInvoices);
        this.invoiceList.push(...newList.object.obppInvoices);
      }
      this.checkAllInvoices = false;
    });
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
    }else{
      this.selectNext = false;
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
    }else if (!this.checkAllInvoices) {
      this.selectNext = true;
    }
  }

  updateOnlyAmount() {
    this.invoiceList.forEach((item: any) => {
      item.paymentAmount =
        item.paymentAmount == '' || item.paymentAmount === null
          ? 0
          : item.paymentAmount;
      if (parseFloat(item.paymentAmount) > parseFloat(item.balanceDue)) {
        item.paymentAmount = 0;
      }
    });
  }

  openCPWAQuickPayGateway() {
    if (this.invoiceLength > 0 && this.paymentAmount > 0) {
      let x: any = [];
      this.invoiceList.forEach((item: any) => {
        if (item.isChecked) {
          x.push({
            paymentCurrency: item.paymentCurrency,
            invoiceCurrency: item.invoiceCurrency,
            accountName: item.accountName,
            accountNumber: item.accountNumber,
            balanceDue: item.balanceDue,
            dueDate: item.dueDate,
            invoiceAmount: parseFloat(item.paymentAmount),
            invoiceDate: item.invoiceDate,
            invoiceNumber: item.invoiceNumber,
            note: null,
            payAmount: parseFloat(item.paymentAmount),
            paymentAmount: parseFloat(item.paymentAmount),
            obppInvoiceShipments: [],
            obppShippingTransactionLog: [],
          });
        }
      });
      this.cpwaQuickPayData = {
        paymentCurrency: this.paymentCurrency,
        createMethod: 'QuickPay-C',
        invoiceList: x,
        paymentType: 'Credit Card',
        totalPayAmount: this.paymentAmount,
        additionalEmailId: this.QuickPaymentForm.get('emailAddress')?.value,
      };
      this.dataSharingService.IsLoadingEnabled.next(true);
      this.obppQuickPayCPWAService
        .getQuickPayCPWAPayment(this.cpwaQuickPayData)
        .subscribe({
          next: (res: any) => {
            this.showIFrame = true;
            this.cpwaPayload = res.serviceResponse.object;

            this.paymentURL = this.obppLoginService.getCPWAPaymentURL();

            this.dataSharingService.IsLoadingEnabled.next(false);
            setTimeout(() => {
              this.init__payment.nativeElement.submit();
            }, 200);
          },
          error: (error) => {
            this.dataSharingService.IsLoadingEnabled.next(false);
          },
        });
    } else {
      let errMsg =
        this.invoiceList.length > 0
          ? 'INVALID_QUICKPAY_NEXT'
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
    if (event.data.rs === '0') {
      this.showIFrame = false;
      return;
    }

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
        .subscribe({
          next: (paymentres: any) => {
            this.paymentInfo = '';
            this.paymentInformation = [];
            if (paymentres['serviceResponse']['type'] == 'success') {
              this.paymentInformation = paymentres['serviceResponse']['object'];
              this.showIFrame = false;
              this.showQuickPay = false;
              this.paymentSuccessFlag = true;
              let paymentDate = this.paymentInformation?.paymentDateTime.slice(0,8)
              const year = paymentDate.slice(0,4)
              const month = paymentDate.slice(4,6)
              const date = paymentDate.slice(6,8)
              paymentDate = new Date(year, month - 1, date);
              const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
              this.paymentDate = paymentDate.toLocaleDateString("en-US",{timezone:timezone,month:"short",day:"2-digit",year:"numeric"})
            
            } else {
              this.declinedMessage = true;
              this.showIFrame = false;
              this.showQuickPay = false;
            }
          }
        });
    }
  }

  printPage() {
    let css = '@page { size: potrait; }',
    head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');
    style.setAttribute('type','text/css' )
    style.media = 'print';
    style.appendChild(document.createTextNode(css));
    head.appendChild(style);
    window.print();
  }

  cloneObject(obj: any) {
    return JSON.parse(JSON.stringify(obj));
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
    if (this.paymentCurrency == 'CAD' && this.cadTotal === 0) {
      return true;
    } else if (this.paymentCurrency == 'USD' && this.usdTotal === 0) {
      return true;
    } else {
      return false;
    }
  }
}

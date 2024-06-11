import {
  Component,
  OnInit,
  QueryList,
  ViewChildren,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import {
  NgbdSortableHeader,
  SortEvent,
} from 'src/app/common/bootstrap-sortable-header/sortable-header.directive';
import { OBPPUserAccountSummaryService } from 'src/app/services/account-summary/account-summary.service';
import { LocalStorageService } from 'src/app/services/global/local-storage.service';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';
import { OBPPModalDialogComponent } from '../../error-component/modal-dialog/modal-dialog.component';
import { OBPPDisputeInvoiceService } from 'src/app/services/dispute-invoice/dispute-invoice.service';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { UtilityService } from '../../../services/common/utility.service';
@Component({
  selector: 'obpp-account-dispute',
  templateUrl: './obpp-account-dispute.component.html',
  styleUrls: ['./obpp-account-dispute.component.scss'],
})
export class OBPPUserAccountDisputeComponent implements OnInit {
  @ViewChildren(NgbdSortableHeader) headers?: QueryList<NgbdSortableHeader>;
  @ViewChild('init__payment') init__payment!: ElementRef;
  @ViewChild('usdCheckbox') usdCheckbox: ElementRef | undefined;
  @ViewChild('cadCheckbox') cadCheckbox: ElementRef | undefined;

  isCAD: boolean = true;
  isUSD: boolean = true;
  paymentCurrency: string = '';
  isUpdateInProgress: boolean = true;
  isViewOnly: boolean = false;
  notifyEmail: string = '';
  displayOtherPymntSuccess: boolean = false;
  displayEftPymntSuccess: boolean = false;
  isEmailRequired: boolean = false;
  quickPaymentData: any = [];
  invoiceList: any = [];
  openedInvoiceLength: any = [];
  closedInvoiceLength: any = [];
  invoiceListGrid: any = [];
  selectedInvoice: any = {};
  checkAllInvoices: boolean = false;
  checkAllpins: boolean = false;
  invoiceLength = 0;
  paymentAmount = 0;
  fieldErrorsObj = [];
  errMsgFactory: any = [];
  searchField = '';
  active = 'opened';
  displayBalDueErrMsg: boolean = false;
  validAmountErrMsg: boolean = false;

  declinedMessage: boolean = false;
  paymentSuccessFlag: boolean = false;
  showIFrame: boolean = false;
  paymentInformation: any = [];
  cpwaPayload: any;
  paymentURL: string = '';

  accountsList: any = [];
  allAccountsList: any = [];
  allAccountsListClosed: any = [];
  accountsListOpenedInvoices: any = [];
  accountsListClosedInvoices: any = [];
  ddHeaderValue1: any = '';
  ddHeaderValue2: any = '';
  ddAccountNumber: string = '';
  shipmentTrackerEnURL: string = '';
  shipmentTrackerFrURL: string = '';
  invoiceDateRange: any = 0;
  displaySuccessDisputeInvoice: boolean = false;
  successDisputeObj: any = {};
  accountName: any;

  profitCenterMappingWithService: any = [
    {
      service: 'Courier',
      profitcenter: ['0000101000'],
    },

    {
      service: 'Freight',
      profitcenter: ['0000102000'],
    },
    {
      service: 'GSCS',
      profitcenter: ['0000103000'],
    },

    {
      service: 'Purolator International',
      profitcenter: ['0000104000'],
    },
  ];

  dispute_reason_options = [
    { code: '', description: 'SELECT_TEXT' },
    { code: 'DISPUTE_REASON_DESC_1', description: 'DISPUTE_REASON_DESC_1' },
    { code: 'DISPUTE_REASON_DESC_2', description: 'DISPUTE_REASON_DESC_2' },
    { code: 'DISPUTE_REASON_DESC_3', description: 'DISPUTE_REASON_DESC_3' },
  ];

   // pagination settings
   currentUserDetailsBatch: any = [];
   currentPage: number = 0;
   totalPages: number = 0;
   rowsPerPage: number = 10;
   currentFirstEntry: number = 1;
   currentLastEntry: number = 10
   p: number = 1;
   cp: number = 1;

  constructor(
    private dataSharingService: DataSharingService,
    private obppLoginService: OBPPLoginService,
    private modalService: NgbModal,
    private router: Router,
    private fb: FormBuilder,
    private obppUserAccountSummaryService: OBPPUserAccountSummaryService,
    public localStorageService: LocalStorageService,
    private obppDisputeInvoiceService: OBPPDisputeInvoiceService,
    private utilityService: UtilityService
  ) {}

  ngOnInit() {
    this.isViewOnly = this.obppLoginService.getIsViewOnly();
    let uname = '';
    if (this.isViewOnly) {
      uname = this.obppLoginService.getLookupUserName();
    } else {
      uname = this.obppLoginService.getUserName();
    }
    this.active = 'opened';
    this.isUpdateInProgress = true;
    this.isEmailRequired = false;
    this.paymentSuccessFlag = false;
    this.displaySuccessDisputeInvoice = false;
    this.checkAllInvoices = false;
    this.showIFrame = false;
    this.paymentInformation = [];
    this.declinedMessage = false;
    this.notifyEmail = '';
    this.dataSharingService.IsLoadingEnabled.next(true);
    forkJoin([
      this.obppUserAccountSummaryService.getUserAccountSummaryByEmail(uname),
    ]).subscribe(
      (res) => {
        this.allAccountsList = this.cloneObject(res[0].serviceResponse.object);
        this.accountsList = this.setupAccountList(
          res[0].serviceResponse.object
        );
        this.accountName = this.accountsList.map((e: any) => [
          e.accountName,
          e.accountNumber,
        ]);
        this.accountName.sort()
        this.accountName = this.accountName
          .map((ar: any) => JSON.stringify(ar))
          .filter((itm: any, idx: any, arr: any) => arr.indexOf(itm) === idx)
          .map((str: any) => JSON.parse(str));
        this.accountName.sort()
        this.accountsListOpenedInvoices = this.accountsList;
        this.getOpenedInvoicesData(res[0]);
        this.dataSharingService.IsLoadingEnabled.next(false);
      },
      (error) => {
        this.dataSharingService.IsLoadingEnabled.next(false);
      }
    );
  }


  checkonCad(event: any): void {
    event.preventDefault(); 
    if (this.cadCheckbox) {
      if(this.cadCheckbox.nativeElement.checked){
        this.isCAD=false;
      }else if (!this.cadCheckbox.nativeElement.checked){
        this.isCAD=true;
      }
      this.cadCheckbox.nativeElement.checked = !this.cadCheckbox.nativeElement.checked;
      this.searchFunc();
    }
  }

  checkonUsd(event: any): void {
    event.preventDefault(); 
    if (this.usdCheckbox) {
      if(this.usdCheckbox.nativeElement.checked){
        this.isUSD=false;
      }else if (!this.usdCheckbox.nativeElement.checked){
        this.isUSD=true;
      }
      this.usdCheckbox.nativeElement.checked = !this.usdCheckbox.nativeElement.checked;
      this.searchFunc();
    }
  }
  
  getShipmentTrackingURL(pin: any, invoice: any) {
    let frightSearchEnURL = environment.frightSearchEnURL;
    let frightSearchFrURL = environment.frightSearchFrURL;
    let courierSearchURL = environment.courierSearchEnURL;
    let puroInternationalURL = environment.puroInternationalURL;
    let gscsURL = environment.gscsURL;
    let siden = pin.service;

    try {
      siden = siden.toLowerCase();
    } catch (e) {
      siden = '';
    }

    frightSearchFrURL = frightSearchFrURL.replace(
      'KEY_PIN_NUMBER',
      pin.pinNumber
    );
    frightSearchEnURL = frightSearchEnURL.replace(
      'KEY_PIN_NUMBER',
      pin.pinNumber
    );
    puroInternationalURL = puroInternationalURL.replace(
      'KEY_PIN_NUMBER',
      pin.pinNumber
    );
    courierSearchURL = courierSearchURL.replace(
      'KEY_PIN_NUMBER',
      pin.pinNumber
    );
    gscsURL = gscsURL.replace(
      'KEY_PIN_NUMBER', 
      pin.pinNumber
    );
    // this.dataSharingService.IsLoadingEnabled.next(true);
    if (this.localStorageService.get('lang') == 'fr') {
      if (siden == 'purolator international') {
        this.openWindow(puroInternationalURL);
      } else if (siden == 'freight') {
        this.openWindow(frightSearchFrURL);
      } else if (siden === 'courier') {
        this.openWindow(courierSearchURL);
      } else {
        // this.openWindow(putoFrURL + pin.pinNumber);
        this.openWindow(gscsURL);
      }
    } else {
      if (siden == 'purolator international') {
        this.openWindow(puroInternationalURL);
      } else if (siden == 'freight') {
        this.openWindow(frightSearchEnURL);
      } else if (siden === 'courier') {
        this.openWindow(courierSearchURL);
      } else {
        this.openWindow(gscsURL);
      }
    }
    // this.dataSharingService.IsLoadingEnabled.next(true);
    // this.obppUserAccountSummaryService.getShipmentTrackerURL(pin).subscribe(
    //   (data) => {
    //     this.dataSharingService.IsLoadingEnabled.next(false);
    //     if (data.serviceResponse.type == 'success') {
    //       let putoFrURL = data.serviceResponse.object.frenchShipmentUrl;
    //       let putoEnURL = data.serviceResponse.object.englishShipmentUrl;
    //       if (this.localStorageService.get('lang') == 'fr') {
    //         if (siden == 'purolator international') {
    //           this.openWindow(puroInternationalURL);
    //         } else if (siden == 'fright') {
    //           this.openWindow(frightSearchFrURL);
    //         } else {
    //           this.openWindow(putoFrURL + pin.pinNumber);
    //         }
    //       } else {
    //         if (siden == 'purolator international') {
    //           this.openWindow(puroInternationalURL);
    //         } else if (siden == 'fright') {
    //           this.openWindow(frightSearchEnURL);
    //         } else {
    //           this.openWindow(putoEnURL + pin.pinNumber);
    //         }
    //       }
    //     }
    //   },
    //   (error) => {
    //     console.log('error', error);
    //     this.dataSharingService.IsLoadingEnabled.next(false);
    //   }
    // );
  }

  openWindow(url: string) {
    try {
      window.open(url, '_blank')!.focus();
    } catch (e) {
      this.openDialog('Error', 'POPUP_ERROR', null, 'OK', 'error');
    }
  }

  getInvlocesCount(obj: any) {
    let c = 0;
    obj.forEach((acc: any) => {
      c += acc.invoiceNumber ? 1 : 0;
    });

    return c;
  }

  getOpenedInvoicesData(opData: any) {
    if (opData.serviceResponse.type == 'success') {
      this.errMsgFactory = [];
      this.ddHeaderValue1 = '(' + this.allAccountsList.length + ')';
      this.ddHeaderValue2 = this.getTotalDueAmount();
      this.ddAccountNumber = '';
    } else {
      if (opData.serviceResponse.type == 'error') {
        this.errMsgFactory = [];
        this.errMsgFactory.push({
          value: opData.serviceResponse.message,
        });
      }
      this.invoiceList = [];
      this.invoiceLength = 0;
      this.paymentAmount = 0;
    }
  }

  onSortPIN({ column, direction }: SortEvent, invoice: any) {
    this.headers?.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
    invoice['pins'] = this.utilityService.onSortPIN(invoice, column, direction);
  }

  dateSort(event: any) {
    const { column, direction } = event;
    this.headers?.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.accountsList = this.utilityService.dateSort(this.accountsList, column, direction);
  }

  onSortPINTable({ column, direction }: SortEvent) {
    this.headers?.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
    this.selectedInvoice.pins = this.utilityService.onSortPINTable(this.selectedInvoice.pins, column, direction);
  }

  onSort({ column, direction }: SortEvent) {
    this.headers?.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
    this.accountsList = this.utilityService.onSort(this.accountsList, column, direction);
  }

  cloneObject(obj: any) {
    if (obj == null) {
      return [];
    }
    return JSON.parse(JSON.stringify(obj));
  }

  updateOnlyAmount(pin: any) {
    if (!pin.isChecked) {
      pin.paymentAmount = pin.balanceDue;
    }
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

  checkDisputeAmout() {
    if (this.selectedInvoice?.dispute.disputeAmount == '') {
      return true;
    } else if (
      parseFloat(this.selectedInvoice?.dispute.disputeAmount) >
      parseFloat(this.selectedInvoice.balanceDue)
    ) {
      return true;
    } else {
      return false;
    }
  }

  updateSelectionPIN(inv: any, pin: any) {
    if (!pin.isChecked) {
      inv.isChecked = false;
      this.checkAllInvoices = false;
      pin.paymentAmount = parseFloat(pin.balanceDue).toFixed(2);
      this.updateOnlyInvPayment(inv);
    } else {
      this.updateOnlyInvPayment(inv);
      if (!inv.pins.find((item: any) => !item.isChecked)) {
        inv.isChecked = true;
        this.updateSelectionInv();
      }
    }
  }

  updateOnlyInvPayment(inv: any) {
    let t: any = 0;
    let tmp;
    inv.pins.forEach((item: any) => {
      if (item.isChecked) {
        tmp = !item.paymentAmount ? 0 : item.paymentAmount;
        t += parseFloat(tmp);
      }
    });
    t = Number.isNaN(t) ? 0 : t;
    inv.payAmount = t.toFixed(2);
    inv.paymentAmount = t.toFixed(2);
  }

  updateSelectionInv() {
    if (!this.accountsList.find((item: any) => !item.isChecked)) {
      this.checkAllInvoices = true;
    }
  }

  selctAllPins(event: any) {
    let t = 0;
    event.pins.forEach((p: any) => {
      if (event.isChecked) {
        p.isChecked = true;
        t += parseFloat(p.paymentAmount);
      } else {
        p.isChecked = false;
        p.paymentAmount = parseFloat(p.balanceDue).toFixed(2);
        this.checkAllInvoices = false;
      }
    });

    event.payAmount = t.toFixed(2);
    event.paymentAmount = t.toFixed(2);
  }

  selctAllInvoices(event: any) {
    this.accountsList.forEach((item: any) => {
      if (this.checkAllInvoices) {
        item.isChecked = true;
      } else {
        item.isChecked = false;
        item.paymentAmount = parseFloat(item.balanceDue).toFixed(2);
        item.payAmount = parseFloat(item.balanceDue).toFixed(2);
      }
      this.selctAllPins(item);
    });
  }

  getInvoicePDF(inv: any) {
    this.obppUserAccountSummaryService.getInvoicePDF(inv).subscribe(
      (res) => {
        let file = new Blob([res], {
          type: 'application/pdf',
        });
        if (file.size > 0) {
          var fileURL = URL.createObjectURL(file);
          window.open(fileURL);
        }
      },
      (error) => {
        console.log('Error', error);
      }
    );
  }

  selectAccountNumber(accountRow: any) {
    this.ddHeaderValue1 =
      accountRow.accountName + ' (A/C #' + accountRow.accountNumber + ')';
    this.ddHeaderValue2 = accountRow.totalAmountDue;
    this.ddAccountNumber = accountRow.accountNumber;

    this.searchFunc();
  }

  setAllAccountValue() {
    this.ddHeaderValue1 = 'All Accounts(' + this.allAccountsList.length + ')';
    this.ddHeaderValue2 = this.getTotalDueAmount();
    this.ddAccountNumber = '';
    this.accountsList = this.getRightSourceObject();
  }

  getTotalDueAmount() {
    return this.allAccountsList
      .map((item: any) => item.totalAmountDue)
      ?.reduce((prev: any, next: any) => prev + next, 0);
  }

  getSelectedInvoiceLength() {
    return this.accountsListOpenedInvoices.filter((item: any) =>
      item.pins.find((p: any) => p.isChecked)
    ).length;
  }

  getSelectedCADTotal() {
    let selInv = this.accountsListOpenedInvoices.filter(
      (item: any) => item.currency == 'CAD'
    );
    let tot = 0;
    selInv.forEach((inv: any) => {
      inv.pins.forEach((p: any) => {
        if (p.isChecked) {
          tot +=
            p.paymentAmount == '' || p.paymentAmount == null
              ? 0
              : parseFloat(p.paymentAmount);
        }
      });
    });
    return tot;
  }

  getSelectedUSDTotal() {
    let selInv = this.accountsListOpenedInvoices.filter(
      (item: any) => item.currency == 'USD'
    );
    let tot = 0;
    selInv.forEach((inv: any) => {
      inv.pins.forEach((p: any) => {
        if (p.isChecked) {
          tot +=
            p.paymentAmount == '' || p.paymentAmount == null
              ? 0
              : parseFloat(p.paymentAmount);
        }
      });
    });
    return tot;
  }

  getSearchString(text: string) {
    text = text.substring(text.lastIndexOf(';') + 1, text.length);
    return text;
  }

  getFirstSearchString(text: string) {
    text = text.substring(0, text.lastIndexOf(';'));
    return text;
  }

  search: OperatorFunction<string, readonly string[]> = (
    text$: Observable<string>
  ) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        this.getSearchString(term).length < 1
          ? []
          : this.selectedInvoice.disputeAllPINS
              .filter(
                (v: any) =>
                  v &&
                  v
                    .toLowerCase()
                    .indexOf(this.getSearchString(term).toLowerCase()) > -1
              )
              .slice(0, 10)
      )
    );

  openDisputePage(inv: any) {
    this.isUpdateInProgress = false;
    this.paymentSuccessFlag = false;
    this.selectedInvoice = this.cloneObject(inv);
    this.selectedInvoice.dispute = {
      disputeAmount: 0,
      disputeReason: '',
      note: '',
    };
    this.selectedInvoice['disputePINS'] = '';
    this.selectedInvoice['disputeAllPINS'] = inv.pins.map(
      (p: any) => p.pinNumber
    );
  }

  viewCart() {
    if (this.paymentCurrency != '' && this.paymentCurrency != null) {
      if (
        (this.getSelectedCADTotal() > 0 && this.paymentCurrency == 'CAD') ||
        (this.getSelectedUSDTotal() > 0 && this.paymentCurrency == 'USD')
      ) {
        this.isUpdateInProgress = false;
        this.getSelectedAccountsList();
      } else {
        this.openDialog(
          'ACC_SUMMARY',
          'PAY_AMOUNT_CANNOT_BE_BLANK',
          null,
          'OK',
          'warning'
        );
      }
    } else {
      this.openDialog('ACC_SUMMARY', 'SELECT_CURRENCY', null, 'OK', 'warning');
    }
  }

  getSelectedAccountsList() {
    this.accountsList = this.getRightSourceObject().filter((acc: any) =>
      acc.pins.find(
        (p: any) => p.isChecked && acc.currency == this.paymentCurrency
      )
    );
  }

  removeInvoice(invoice: any) {
    invoice.isChecked = false;
    invoice.pins.forEach((item: any) => (item.isChecked = false));
    this.accountsList = this.getRightSourceObject();
    this.selctAllPins(invoice);
    this.updateSelectionInv();
    this.getSelectedAccountsList();
  }

  goBackSummaryPage() {
    this.isUpdateInProgress = true;
    this.showIFrame = false;
    this.declinedMessage = false;
    this.displaySuccessDisputeInvoice = false;
    this.accountsList = this.getRightSourceObject();
    this.cp = 1;
  }

  returnToDispute() {
    this.ngOnInit();
  }

  getCartTotal() {
    if (this.paymentCurrency == 'CAD') {
      return this.getSelectedCADTotal();
    } else if (this.paymentCurrency == 'USD') {
      return this.getSelectedUSDTotal();
    }

    return 0;
  }

  openDialog(
    title: string,
    body: string,
    firstButton: any,
    secondButton: any,
    type: string
  ) {
    const modalRef = this.modalService.open(OBPPModalDialogComponent);
    modalRef.componentInstance.my_modal_title = title;
    modalRef.componentInstance.my_modal_content = body;
    modalRef.componentInstance.firstButtonLabel = firstButton;
    modalRef.componentInstance.secondButtonLabel = secondButton;
    modalRef.componentInstance.modalType = type;
  }

  getRightSourceObject() {
    return this.active == 'closed'
      ? this.accountsListClosedInvoices
      : this.accountsListOpenedInvoices;
  }

  searchFunc() {
    if (this.ddAccountNumber == '') {
      this.accountsList = this.getRightSourceObject();
    } else {
      this.accountsList = this.getRightSourceObject().filter(
        (item: any) => item.accounts.accountNumber == this.ddAccountNumber
      );
    }

    if (this.searchField) {
      if (
        this.accountsList.find(
          (item: any) => item.invoiceNumber == this.searchField
        )
      ) {
        this.accountsList = this.accountsList.filter(
          (item: any) => item.invoiceNumber == this.searchField
        );
      } else {
        this.accountsList = this.accountsList.filter((item: any) =>
          item.pins.find((p: any) => p.pinNumber == this.searchField)
        );
      }
    }
    if (this.isCAD && this.isUSD) {
      this.accountsList = this.accountsList.filter(
        (item: any) => item.currency == 'CAD' || item.currency == 'USD'
      );
    } else if (this.isCAD) {
      this.accountsList = this.accountsList.filter(
        (item: any) => item.currency == 'CAD'
      );
    } else if (this.isUSD) {
      this.accountsList = this.accountsList.filter(
        (item: any) => item.currency == 'USD'
      );
    } else {
      this.accountsList = this.accountsList.filter(
        (item: any) => item.currency == ''
      );
    }

    if (this.invoiceDateRange > 0) {
      this.accountsList = this.accountsList.filter((item: any) =>
        this.dateCheck(item.invoiceDate, this.invoiceDateRange)
      );
    }
  }

  invoiceSearch(skey: any) {
    if (this.searchField) {
      if (
        this.getRightSourceObject().find(
          (item: any) => item.invoiceNumber == skey
        )
      ) {
        this.accountsList = this.getRightSourceObject().filter(
          (item: any) => item.invoiceNumber == skey
        );
      } else {
        this.accountsList = this.getRightSourceObject().filter((item: any) =>
          item.pins.find((p: any) => p.pinNumber == skey)
        );
      }
    }
  }

  clearActnSmrySearchResult() {
    this.searchField = '';
    this.accountsList = this.getRightSourceObject();
  }

  searchByCurrency() {
    let obj = this.getRightSourceObject();
    if (this.isCAD && this.isUSD) {
      this.accountsList = obj;
    } else if (this.isCAD) {
      this.accountsList = obj.filter((item: any) => item.currency == 'CAD');
    } else if (this.isUSD) {
      this.accountsList = obj.filter((item: any) => item.currency == 'USD');
    } else {
      this.accountsList = obj.filter((item: any) => item.currency == '');
    }
  }

  isValidEmail(emailString: string): boolean {
    try {
      let pattern = new RegExp('^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-zA-Z]{2,7}$');
      let valid = pattern.test(emailString);
      return valid;
    } catch (TypeError) {
      return false;
    }
  }

  printPage() {
  let css = '@page { size: landscape; }',
    head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');
    style.setAttribute('type','text/css' )
    style.media = 'print';
    style.appendChild(document.createTextNode(css));
    head.appendChild(style);
    window.print();
  }

  appendText(st: any, where: string, n: any, what: string) {
    let tmp = st;
    if (st?.toString().length < n) {
      for (let i = n; i > tmp.toString().length; i--) {
        if (where == 'pre') {
          st = what + st.toString();
        } else {
          st = st.toString() + what;
        }
      }
    } else if (!st) {
      st = '';
      for (let i = 0; i < n; i++) {
        st += what;
      }
    }

    return st;
  }

  submitDispute() {
    if (
      !this.checkDisputeAmout() &&
      this.selectedInvoice.dispute.disputeReason != ''
    ) {
      let data = {
        firstName:
          this.obppLoginService.getUserDetails().serviceResponse.firstName,
        lastName:
          this.obppLoginService.getUserDetails().serviceResponse.lastName,
        userId: this.obppLoginService.getUserDetails().serviceResponse.userName,
        invoice: this.selectedInvoice,
      };
      this.successDisputeObj = {};
      this.dataSharingService.IsLoadingEnabled.next(true);
      this.obppDisputeInvoiceService.submitDisputeInvoice(data).subscribe(
        (res) => {
          if (res.serviceResponse?.type == 'success') {
            this.successDisputeObj = res.serviceResponse.object;
            this.isUpdateInProgress = false;
            this.paymentSuccessFlag = false;
            this.displaySuccessDisputeInvoice = true;
          } else {
            this.openDialog(
              'SUBMIT_DISPUTE',
              'GENERIC_ERROR',
              'OK',
              null,
              'warning'
            );
            this.isUpdateInProgress = false;
            this.paymentSuccessFlag = false;
            this.displaySuccessDisputeInvoice = false;
          }
          this.dataSharingService.IsLoadingEnabled.next(false);
        },
        (error) => {
          this.dataSharingService.IsLoadingEnabled.next(false);
          this.openDialog(
            'SUBMIT_DISPUTE',
            'GENERIC_ERROR',
            'OK',
            null,
            'warning'
          );
          this.isUpdateInProgress = false;
          this.paymentSuccessFlag = false;
          this.displaySuccessDisputeInvoice = false;
        }
      );
    } else {
      alert('Fails Validation');
    }
  }

  dateCheck(dt1: any, dur: any) {
    dt1 = new Date(dt1);
    let tday = new Date();

    if (this.monthDiff(dt1, tday) <= dur) {
      return true;
    }

    return false;
  }

  getService(pc: string) {
    pc = pc?.trim();
    let pf = this.profitCenterMappingWithService.find((item: any) =>
      item.profitcenter.find((p: any) => p == pc)
    );
    if (pf) {
      return pf.service;
    }

    return '';
  }

  monthDiff(dateFrom: any, dateTo: any) {
    return (
      dateTo.getMonth() -
      dateFrom.getMonth() +
      12 * (dateTo.getFullYear() - dateFrom.getFullYear())
    );
  }

  getGivenPINS(inv: any) {
    let pins: any = [];

    inv?.shipments.forEach((p: any) => {
      pins.push({
        pinNumber: p.pin,
        dueDate: p.shipDate,
        balanceDue: p.dueAmount,
        serviceIdentifier: p.serviceIdentifier,
        totalCharges: p.totalCharges,
        paymentAmount: p.dueAmount,
        itemNumber: p.itemNumber,
        profitCenter: p.profitCenter,
        service: this.getService(p.profitCenter),
      });
    });

    return pins;
  }

  setupAccountList(obj: any) {
    let res = [];
    res = this.cloneObject(obj);

    res = res.map((acc: any) =>
      acc.invoices.map((inv: any) => {
        delete acc.invoices;
        inv.accounts = acc;
        inv.paymentAmount = 0;
        inv.payAmount = 0;
        inv.currency = inv.invoiceCurrency;
        inv.pins = this.cloneObject(this.getGivenPINS(inv));
        return inv;
      })
    );
    res = [].concat(...res);

    return res;
  }
}

import {
  Component,
  OnInit,
  QueryList,
  ViewChildren,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
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
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { UtilityService } from '../../../services/common/utility.service';

@Component({
  selector: 'obpp-account-summary',
  templateUrl: './obpp-account-summary.component.html',
  styleUrls: ['./obpp-account-summary.component.scss'],
})
export class OBPPUserAccountSummaryComponent implements OnInit {
  @ViewChildren(NgbdSortableHeader) headers?: QueryList<NgbdSortableHeader>;
  @ViewChild('init__payment') init__payment!: ElementRef;
  @ViewChild('paymentIFrame') paymentIFrame!: ElementRef;
  @ViewChild('usdCheckbox') usdCheckbox: ElementRef | undefined;
  @ViewChild('cadCheckbox') cadCheckbox: ElementRef | undefined;

  isCAD: boolean = true;
  isUSD: boolean = true;
  // pagination settings
  currentUserDetailsBatch: any = [];
  currentPage: number = 0;
  totalPages: number = 0;
  rowsPerPage: number = 10;
  currentFirstEntry: number = 1;
  currentLastEntry: number = 10;

  p: number = 1;

  paymentCurrency: string = '';
  isUpdateInProgress: boolean = true;
  isViewOnly: boolean = false;
  notifyEmail: string = '';
  displayOtherPymntSuccess: boolean = false;
  displayEftPymntSuccess: boolean = false;
  isEmailRequired: boolean = false;
  quickPaymentData: any = [];
  invoiceList: any = [];
  isAllSelected:boolean=false;
  openedInvoiceLength: any = [];
  closedInvoiceLength: any = [];
  invoiceListGrid: any = [];
  selectedInvoice: string = '';
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
  staticAccountsListOpenedInvoices: any = [];
  staticAccountsListClosedInvoices: any = [];
  ddHeaderValue1: any = '';
  ddHeaderValue2: any = '';
  ddAccountNumber: string = '';
  shipmentTrackerEnURL: string = '';
  shipmentTrackerFrURL: string = '';
  invoiceDateRange: any = 0;
  visiblePinsCount: number = 50;

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

  @ViewChild('cad')
  cad!: ElementRef;

  @ViewChild('usd')
  usd!: ElementRef;
  accountName: any;
  isErrorMessage: boolean = false;
  errorMessage: string = '';
  uname: string = '';
  showCustomerCareMessage: boolean = false;
  paymentDate: any;

  constructor(
    private dataSharingService: DataSharingService,
    private obppLoginService: OBPPLoginService,
    private modalService: NgbModal,
    private obppUserAccountSummaryService: OBPPUserAccountSummaryService,
    public localStorageService: LocalStorageService,
    private http: HttpClient,
    private utilityService: UtilityService
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0);
    this.isViewOnly = this.obppLoginService.getIsViewOnly();
    if (this.isViewOnly) {
      this.uname = this.obppLoginService.getLookupUserName();
    } else {
      this.uname = this.obppLoginService.getUserName();
    }

    this.active = 'opened';
    this.isUpdateInProgress = true;
    this.isEmailRequired = false;
    this.paymentSuccessFlag = false;
    this.checkAllInvoices = false;
    this.showIFrame = false;
    this.paymentInformation = [];
    this.declinedMessage = false;
    this.notifyEmail = '';
    this.dataSharingService.IsLoadingEnabled.next(true);
    this.getInvoices();
  }

  getVisiblePins(invoice: any){
    return invoice.pins.slice(0, this.visiblePinsCount);
  }
  divScroll(event: any) {
    const scrollTop = event.target.scrollTop;
    const scrollHeight = event.target.scrollHeight;
    const clientHeight = event.target.clientHeight;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight;
    if (isAtBottom) {
      this.visiblePinsCount += 50;
    }
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
      this.searchFunc(false);
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
      this.searchFunc(false);
    }
  }

  getInvoices() {
    this.dataSharingService.IsLoadingEnabled.next(true);
    forkJoin([
      this.obppUserAccountSummaryService.getUserAccountSummaryByEmail(
        this.uname
      ),
      this.obppUserAccountSummaryService.getUserClosedAccountSummaryByEmail(
        this.uname
      ),
    ]).subscribe({
      next: (res) => {
        this.allAccountsList = this.cloneObject(res[0].serviceResponse.object);
        this.allAccountsListClosed = this.cloneObject(
          res[1].serviceResponse.object
        );
        this.accountsList = this.setupAccountList(
          res[0].serviceResponse.object
        );
        this.accountName = this.accountsList.map((e: any) => [
          e.accountName,
          e.accountNumber,
        ]);
        this.accountName.sort();
        this.accountName = this.accountName
          .map((ar: any) => JSON.stringify(ar))
          .filter((itm: any, idx: any, arr: any) => arr.indexOf(itm) === idx)
          .map((str: any) => JSON.parse(str));
          
          this.accountName.sort();
        this.accountsListOpenedInvoices = this.accountsList;
        this.staticAccountsListOpenedInvoices=this.cloneObject(this.accountsListOpenedInvoices);
        this.totalPages = Math.ceil(
          this.accountsList.length / this.rowsPerPage
        );
        this.currentPage = 0;
        this.currentUserDetailsBatch =
          this.totalPages !== 0
            ? this.accountsList.slice(0, this.rowsPerPage)
            : this.accountsList;
        this.currentFirstEntry = 1;
        this.currentLastEntry = 10;

        this.accountsListClosedInvoices = this.setupAccountList(
          this.cloneObject(res[1].serviceResponse.object)
        );
        this.staticAccountsListClosedInvoices=this.accountsListClosedInvoices;
        this.getOpenedInvoicesData(res[0]);
        this.dataSharingService.IsLoadingEnabled.next(false);
      },
      error: (error) => {
        console.log('Error', error);
        this.dataSharingService.IsLoadingEnabled.next(false);
      },
    });
  }

  getShipmentTrackingURL(pin: any, invoice: any) {
    let frightSearchEnURL = environment.frightSearchEnURL;
    let frightSearchFrURL = environment.frightSearchFrURL;
    let courierSearchEnURL = environment.courierSearchEnURL;
    let courierSearchFrURL = environment.courierSearchFrURL;
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
    courierSearchEnURL = courierSearchEnURL.replace(
      'KEY_PIN_NUMBER',
      pin.pinNumber
    );
    courierSearchFrURL = courierSearchFrURL.replace(
      'KEY_PIN_NUMBER',
      pin.pinNumber
    );
    puroInternationalURL = puroInternationalURL.replace(
      'KEY_PIN_NUMBER',
      pin.pinNumber
    );
    gscsURL = gscsURL.replace('KEY_PIN_NUMBER', pin.pinNumber);
    if (this.localStorageService.get('lang') == 'fr') {
      if (siden == 'purolator international') {
        this.openWindow(puroInternationalURL);
      } else if (siden == 'freight') {
        this.openWindow(frightSearchFrURL);
      } else if (siden === 'courier') {
        //  this.getCourierUrl(pin.pinNumber)
        this.openWindow(courierSearchFrURL);
      } else {
        this.openWindow(gscsURL);
      }
    } else {
      if (siden == 'purolator international') {
        this.openWindow(puroInternationalURL);
      } else if (siden == 'freight') {
        this.openWindow(frightSearchEnURL);
      } else if (siden === 'courier') {
        this.openWindow(courierSearchEnURL);
      } else {
        this.openWindow(gscsURL);
      }
    }
  }

  getCourierUrl(pin: any) {
    this.obppUserAccountSummaryService.getShipmentTrackerURL(pin).subscribe({
      next: (data) => {
        this.dataSharingService.IsLoadingEnabled.next(false);
        if (data.serviceResponse.type == 'success') {
          let putoFrURL = data.serviceResponse.object.frenchShipmentUrl;
          let putoEnURL = data.serviceResponse.object.englishShipmentUrl;
          if (this.localStorageService.get('lang') == 'fr') {
            this.openWindow(putoFrURL);
          } else {
            this.openWindow(putoEnURL);
          }
        }
      },
      error: (error) => {
        this.dataSharingService.IsLoadingEnabled.next(false);
      },
    });
  }

  openWindow(url: string) {
    try {
      window.open(url, '_blank')!.focus();
    } catch (e) {
      this.openDialog('Error', 'POPUP_ERROR', null, 'OK', 'error');
    }
  }

  getInvlocesCount(obj: any) {
    if (this.accountName) {
      this.accountName.sort();
    }
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

  onSort({ column, direction }: SortEvent) {
    this.headers?.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
    this.accountsList = this.utilityService.onSort(this.accountsList, column, direction);
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

  cloneObject(obj: any) {
    if (!obj) {
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
    this.dataSharingService.IsLoadingEnabled.next(true);
    this.obppUserAccountSummaryService.getInvoicePDF(inv).subscribe({
      next: (res) => {
        let pdfFile = new Blob([res], { type: 'application/pdf' });
  
        if (pdfFile.size > 0) {
          const pdfUrl = window.URL.createObjectURL(pdfFile);
          const htmlContent = `
            <html>
            <head>
              <title>PDF Viewer</title>
            </head>
            <body>
              <iframe src="${pdfUrl}" width="100%" height="100%" style="border: none;"></iframe>
            </body>
            </html>
          `;
          const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
          const htmlUrl = window.URL.createObjectURL(htmlBlob);
          window.open(htmlUrl, '_blank');
          this.dataSharingService.IsLoadingEnabled.next(false);
        }
      },
      error: (error) => {
        this.errorMessageModal(
          'DOWNLOAD_ERROR',
          "PDF_UNAVAILABLE",
          "",
          '',
          'EFT_GUIDELINES_CLOSE',
          'error'
        )
        this.dataSharingService.IsLoadingEnabled.next(false);
        console.log('Error', error);
      },
    });
  }

  errorMessageModal(
    title: string,
    errorMsg: string,
    desc: string,
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
  }

  selectAccountNumber(accountRow: any) {
    this.accountsListClosedInvoices=this.staticAccountsListClosedInvoices;
    this.accountsListOpenedInvoices=this.staticAccountsListOpenedInvoices;
    this.currentPage = 0;
    this.p = 0;
    if (accountRow === 'All Accounts') {
      this.isAllSelected=true;
      this.ddAccountNumber='';
      this.accountsList = this.setupAccountList(this.allAccountsList);
      if (this.active === 'closed') {
        this.ChangeTab('closed');
      }
      this.searchFunc(false);
    } else {
      this.isAllSelected=false;
      accountRow = accountRow.split(',');
      this.ddHeaderValue1 = accountRow[0] + ' (A/C #' + accountRow[1] + ')';
      this.ddHeaderValue2 = accountRow[2];
      this.ddAccountNumber = accountRow[1];

      this.searchFunc(true);
      this.accountName = this.accountName
        .map((ar: any) => JSON.stringify(ar))
        .filter((itm: any, idx: any, arr: any) => arr.indexOf(itm) === idx)
        .map((str: any) => JSON.parse(str));
    }
    this.accountName = this.accountsList.map((e: any) => [
      e.accountName,
      e.accountNumber,
    ]);
    const unique = ((seen) =>
      this.accountName.filter((o: any) => {
        if (o[0] == null || o[1] == null) {
          return false;
        }
        const key = `${o[0]}-${o[1]}`;
        return !seen.has(key) && seen.add(key);
      }))(new Set());
    this.accountName = unique;
  }

  setAllAccountValue() {
    this.ddHeaderValue1 = '(' + this.allAccountsList.length + ')';
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
      acc.payAmount !== "0.00" && acc.pins.some(
        (p: any) => p.isChecked && acc.currency === this.paymentCurrency
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
    this.accountsList = this.getRightSourceObject();
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

  searchFunc(flag:boolean) {
    if(this.isAllSelected){
      this.accountsListClosedInvoices=this.staticAccountsListClosedInvoices;
     this.accountsListOpenedInvoices=this.staticAccountsListOpenedInvoices;
    }
     if(flag ){
      this.accountsListClosedInvoices=this.accountsListClosedInvoices.filter(
        (item: any) => item.accountNumber == this.ddAccountNumber
      );
      this.accountsListOpenedInvoices=this.accountsListOpenedInvoices.filter(
        (item: any) => item.accountNumber == this.ddAccountNumber
      );
     }
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

  ChangeTab(t: string) {
    this.p = 1;
    if (t != this.active && t == 'closed') {
      this.accountsList = this.cloneObject(this.accountsListClosedInvoices);
    } else if (t != this.active && t == 'opened') {
      this.accountsList = this.cloneObject(this.accountsListOpenedInvoices);
    }
    this.accountName = this.accountsList.map((e: any) => [
      e.accountName,
      e.accountNumber,
    ]);
    this.accountName.sort();
    const unique = ((seen) =>
      this.accountName.filter((o: any) => {
        if (o[0] == null || o[1] == null) {
          return false;
        }
        const key = `${o[0]}-${o[1]}`;
        return !seen.has(key) && seen.add(key);
      }))(new Set());

    this.accountName = unique;

    this.active = t;
    this.clearActnSmrySearchResult();
    this.setAllAccountValue();
    this.isCAD = true;
    this.isUSD = true;
    this.searchField = '';
  }

  isValidEmail(emailString: string): boolean {
    try {
      let pattern = new RegExp(
        '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,7}$'
      );
      let valid = pattern.test(emailString);
      return valid;
    } catch (error) {
      return false;
    }
  }

  loadIFrame() {
    if (
      !this.isEmailRequired ||
      (this.isEmailRequired && this.isValidEmail(this.notifyEmail))
    ) {
      if (this.getCartTotal() > 0) {
        this.submitPayment();
        setTimeout(() => {
          this.paymentIFrame.nativeElement.focus();
        }, 2000);
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
      this.openDialog('ACC_SUMMARY', 'EMAIL_VALID', null, 'OK', 'warning');
    }
  }

  submitPayment() {
    this.dataSharingService.IsLoadingEnabled.next(true);
    const emailNotification: string = this.localStorageService.get(
      window.btoa('sendPaymentNotification')
    );
    let invPayload: any = {
      paymentCurrency: this.paymentCurrency,
      receiveEmail: window.atob(emailNotification),
      receiveEmailAt: this.obppLoginService.getUserName(),
      userId: this.obppLoginService.getUserName(),
      totalPayAmount: this.getCartTotal(),
      invoiceList: [],
      createMethod: 'PayNow',
    };
    if (this.isEmailRequired) {
      invPayload['additionalEmailId'] = this.notifyEmail;
    }
    this.accountsList.forEach((item: any) => {
      invPayload.invoiceList.push({
        accountName: item.accounts.accountName,
        accountNumber: item.accounts.accountNumber,
        invoiceNumber: item.invoiceNumber,
        invoiceDate: Date.parse(item.invoiceDate),
        dueDate: Date.parse(item.dueDate),
        paymentAmount: item.paymentAmount,
        invoiceAmount: item.invoiceAmount,
        balanceDue: item.balanceDue,
        note: '',
        obppInvoiceShipments: item.pins
          .filter((pk: any) => pk.isChecked)
          .map((p: any) => ({
            shipmentPin: p.pinNumber,
            shipmentDate: null,
            totalCharges: p.totalCharges,
            pinAmount: parseFloat(p.balanceDue) - parseFloat(p.paymentAmount),
            pinAmountPaid: p.paymentAmount,
            itemNumber: p.itemNumber,
            merchantID: '',
          })),
      });
    });

    this.obppUserAccountSummaryService
      .submitPaymentToCPWAEncrypt(invPayload)
      .subscribe({
        next: (res: any) => {
          if (res.serviceResponse.type == 'success') {
            this.showIFrame = true;
            this.cpwaPayload = res.serviceResponse.object;
            this.paymentURL = this.obppLoginService.getCPWAPaymentURL();
            this.dataSharingService.IsLoadingEnabled.next(false);
            setTimeout(() => {
              this.init__payment.nativeElement.submit();
            }, 200);
          } else {
            this.declinedMessage = true;
            this.showIFrame = false;
            this.paymentSuccessFlag = false;
          }
          this.dataSharingService.IsLoadingEnabled.next(false);
        },
        error: (error) => {
          this.declinedMessage = true;
          this.showIFrame = false;
          this.paymentSuccessFlag = false;
          this.dataSharingService.IsLoadingEnabled.next(false);
        },
      });
  }

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent): void {
    if (event.data.event === 'cpwaProcessing') {
      this.dataSharingService.isPaymentInProgress.next(true);
    }

    if (event.data.event === 'cpwaProcessed') {
      this.dataSharingService.isPaymentInProgress.next(false);
    }

    if (event.data.event === 'cpwaCommit') {
      this.dataSharingService.isPaymentInProgress.next(true);
      let payload;
      let property: keyof typeof event.data;
      for (property in event.data) {
        if (property === 'payload') {
          payload = event.data[property];
        }
      }

      const emailNotification: string = this.localStorageService.get(
        window.btoa('sendPaymentNotification')
      );

      let quickPaySumitpayment: any = {
        paymentCurrency: this.paymentCurrency,
        receiveEmail: window.atob(emailNotification),
        receiveEmailAt: this.obppLoginService.getUserName(),
        userId: this.obppLoginService.getUserName(),
        totalPayAmount: this.getCartTotal(),
        invoiceList: [],
        encryptedPayload: this.cpwaPayload,
        encryptedPaymentResult: payload,
        createMethod: 'PayNow',
        invoiceListTemp: [],
      };

      if (this.isEmailRequired) {
        quickPaySumitpayment['additionalEmailId'] = this.notifyEmail;
      }

      this.accountsList.forEach((item: any) => {
        quickPaySumitpayment.invoiceList.push({
          accountName: item.accounts.accountName,
          accountNumber: item.accounts.accountNumber,
          invoiceNumber: item.invoiceNumber,
          invoiceDate: Date.parse(item.invoiceDate),
          dueDate: Date.parse(item.dueDate),
          paymentAmount: item.paymentAmount,
          invoiceAmount: item.invoiceAmount,
          balanceDue: item.balanceDue,
          note: '',
          obppInvoiceShipments: item.pins
            .filter((pk: any) => pk.isChecked)
            .map((p: any) => ({
              shipmentPin: p.pinNumber,
              shipmentDate: null,
              totalCharges: p.totalCharges,
              pinAmount: parseFloat(p.balanceDue) - parseFloat(p.paymentAmount),
              pinAmountPaid: p.paymentAmount,
              itemNumber: p.itemNumber,
              merchantID: '',
            })),
        });
        quickPaySumitpayment.invoiceListTemp.push({
          accountName: item.accounts.accountName,
          accountNumber: item.accounts.accountNumber,
          invoiceNumber: item.invoiceNumber,
          invoiceDate: item.invoiceDate,
          dueDate: item.dueDate,
          paymentAmount: item.paymentAmount,
          invoiceAmount: item.invoiceAmount,
          balanceDue: item.balanceDue,
          note: '',
        });
      });

      this.obppUserAccountSummaryService
        .submitPaymentToCpwaDecrypt(quickPaySumitpayment)
        .subscribe({
          next: (paymentres: any) => {
            this.showCustomerCareMessage = false;
            this.paymentInformation = [];
            if (paymentres['serviceResponse']['type'] == 'success') {
              this.paymentInformation = paymentres['serviceResponse']['object'];
              this.showIFrame = false;
              this.paymentSuccessFlag = true;
              let paymentDate =
                this.paymentInformation?.payment?.paymentDate.slice(0, 8);
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
              this.declinedMessage = true;
              this.showIFrame = false;
              this.paymentSuccessFlag = false;
            }
            this.dataSharingService.isPaymentInProgress.next(false);
          },
          error: (err) => {
            this.showCustomerCareMessage = true;
            this.dataSharingService.isPaymentInProgress.next(false);
          },
        });
    }
  }

  getEmailReceivers(paymentInformation: any) {
    if (paymentInformation.additionalEmailId) {
      return (
        this.obppLoginService.getUserName() +
        ' AND ' +
        paymentInformation.additionalEmailId
      );
    }
    return this.obppLoginService.getUserName();
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
        paymentAmount: parseFloat(p.dueAmount).toFixed(2),
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

  setPaymentCurrency(paymentType: string) {
    if (paymentType === 'cad') {
      this.cad.nativeElement.checked = true;
      this.paymentCurrency = 'CAD';
    } else if (paymentType === 'usd') {
      this.usd.nativeElement.checked = true;
      this.paymentCurrency = 'USD';
    }
  }

  downloadStatement() {
    this.isErrorMessage = false;
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    const currDate = year + '-' + month + '-' + day;
    const postData = {
      fromDate: '2007-01-01',
      toDate: currDate,
      uname: this.obppLoginService.getUserName(),
    };

    this.obppUserAccountSummaryService
      .accountStatementDownload(postData)
      .subscribe({
        next: (data) => {
          if (data) {
            const a = document.createElement('a');
            a.href = 'data:text/csv,' + data;
            let filename = `AccountStatement_${
              new Date().toISOString().split('T')[0]
            }`;
            a.setAttribute('download', filename + '.csv');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            this.isErrorMessage = true;
            this.errorMessage = 'DOWNLOAD_STATEMENT_ERROR';
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  selectCheckBox(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const checkbox = event.target as HTMLInputElement;
    checkbox.click();
  }
}

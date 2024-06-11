import { CurrencyPipe } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AdminLooseBillsService } from 'src/app/services/admin-loose-bills/admin-loose-bills.services';
import { OBPPQuickPayCPWAService } from 'src/app/services/cpwa-services/quickpay-cpwa.services';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';
import { OBPPModalDialogComponent } from '../../error-component/modal-dialog/modal-dialog.component';

@Component({
  selector: 'app-obpp-loose-bills',
  templateUrl: './obpp-loose-bills.component.html',
  styleUrls: ['./obpp-loose-bills.component.css'],
})
export class ObppLooseBillsComponent implements OnInit {
  @ViewChild('init__payment') init__payment!: ElementRef;
  paymentSuccessFlag: boolean = false;
  showIFrame: boolean = false;
  quickPayForm: FormGroup;
  paymentInformation: any = [];
  declinedMessage: boolean = false;
  cpwaPayload: any;
  paymentInfo: string = ''; // will be deleted
  showLooseBills: boolean = true;
  paymentURL = '';
  cpwaQuickPayData: any;
  submitted: boolean = false;

  constructor(
    private dataSharingService: DataSharingService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private router: Router,
    public translate: TranslateService,
    private obbpLoginService: OBPPLoginService,
    private obbpLooseBills: AdminLooseBillsService,
    private currencyPipe: CurrencyPipe,
    private obppQuickPayCPWAService: OBPPQuickPayCPWAService,
    private obppLoginService: OBPPLoginService,
  ) {
    this.quickPayForm = this.fb.group({
      amount: ['', [Validators.required]],
      shipmentPin: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9]*$'),
          Validators.maxLength(12),
        ],
      ],
      accountNumber: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9]{2,12}$'),
          Validators.maxLength(12),
        ],
      ],
    });
    this.paymentURL = this.obppLoginService.getCPWAPaymentURL();
  }

  ngOnInit(): void {
    this.submitted = false;
  }
  onNext() {
    this.submitted = true;
    if (this.quickPayForm.valid) {
      let requestData = {
        totalPayAmount: Number(
          this.extractActualAmountValue(this.quickPayForm.get('amount')?.value)
        ),
        paymentCurrency: "CAD",
        paymentType: 'C',
        createMethod: 'LooseBill',
        invoiceList: [
          {
            paymentAmount: Number(
              this.extractActualAmountValue(
                this.quickPayForm.get('amount')?.value
              )
            ),
            accountNumber: this.quickPayForm.get('accountNumber')?.value,
            obppInvoiceShipments: [
              { shipmentPin: this.quickPayForm.get('shipmentPin')?.value },
            ],
          },
        ],
      };
      this.dataSharingService.IsLoadingEnabled.next(true);
      this.obbpLooseBills
        .submitQuickpayData(requestData, this.obbpLoginService.getAuthToken())
        .subscribe({
          next: (data: any) => {
            if (data?.serviceResponse?.type === 'success') {
              this.showLooseBills = false;
              this.showIFrame = true;
              this.cpwaPayload = data.serviceResponse.object;
              this.cpwaQuickPayData = requestData;
              this.paymentURL = this.obppLoginService.getCPWAPaymentURL();
              this.dataSharingService.IsLoadingEnabled.next(false);
              setTimeout(() => {
                this.init__payment.nativeElement.submit();
              }, 200);
            }
          },
          error: (error) => {
            this.dataSharingService.IsLoadingEnabled.next(false);
          },
        });
    }
  }
  reset() {
    this.quickPayForm.reset();
    this.submitted = false;
  }
  transformTotal(event: any) {
    const value = this.quickPayForm.get(event.target.name)?.value;
    this.quickPayForm
      .get(event.target.name)
      ?.setValue(this.formatMoney(value.replace(/\,/g, '').replace('$', '')), {
        emitEvent: false,
      });
  }
  formatMoney(value: string) {
    const temp = `${value}`.replace(/\,/g, '');
    return this.currencyPipe.transform(temp);
  }

  extractActualAmountValue(value: string) {
    if (value) {
      return value.replace(',', '').replace('$', '');
    }
    return value;
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

  returnToManageUsers() {
    this.router.navigateByUrl('/manageusers');
    this.dataSharingService.activeIdString.next('/manageusers');
  }
  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent): void {
    if (event.data.event === 'cpwaCommit') {
      let payload;
      let property: keyof typeof event.data;
      for (property in event.data) {
        if (property === 'payload') {
          payload = event.data[property];
        }
      }

      let quickPaySumitpayment = {
        paymentCurrency: this.cpwaQuickPayData.paymentCurrency,
        createMethod: this.cpwaQuickPayData.createMethod,
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
              this.showLooseBills = false;
              this.paymentSuccessFlag = true;
            } else if (
              paymentres['serviceResponse']['type'] == 'error' &&
              paymentres['serviceResponse']['code'] == '8111'
            ) {
              this.declinedMessage = false;
              this.showIFrame = false;
              this.showLooseBills = true;
            } else {
              this.declinedMessage = true;
              this.showIFrame = false;
              this.showLooseBills = false;
            }
          },
          error: (err) => {
            this.declinedMessage = true;
            this.showIFrame = false;
            this.showLooseBills = false;
          },
        });
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
}

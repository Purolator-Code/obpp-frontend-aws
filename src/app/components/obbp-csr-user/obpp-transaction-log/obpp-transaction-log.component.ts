import { CurrencyPipe } from '@angular/common';
import { Component, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map } from 'rxjs';
import {
  NgbdSortableHeader,
  SortEvent,
} from 'src/app/common/bootstrap-sortable-header/sortable-header.directive';
import { AdminTransactionLogService } from 'src/app/services/admin-transaction-log/admin-transaction-log.services';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';

const compare = (v1: string | number, v2: string | number) =>
  v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
const now = new Date();

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'app-obpp-transaction-log',
  templateUrl: './obpp-transaction-log.component.html',
  styleUrls: ['./obpp-transaction-log.component.css'],
})
export class ObppTransactionLogComponent {
  @ViewChildren(NgbdSortableHeader) headers?: QueryList<NgbdSortableHeader>;
  transactionLogSearchForm: FormGroup;
  transactions: any = [];
  transactionsAll: any = [];
  $transactionLogMetaData;
  minDate = {
    year: now.getFullYear() - 1,
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
  maxDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
  minToDate = {
    year: now.getFullYear() - 1,
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
  maxToDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
  today = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
  cleardate = { year: '', month: '', day: '' };
  model: any;
  modelTo: any;
  changeCreditTypeDefaultValue: string = 'ALL';
  paymentTypeDefaultValue: string = 'ALL';
  paymentStatusDefaultValue: string = 'ALL';
  createdMethodeDefaultValue: string = 'ALL';
  sendToSAPDefaultValue: string = 'ALL';
  paymentStatusOptions = [
    { label: 'All', value: 'All' },
    { label: 'TL_APPROVED_LABEL', value: 'Approved' },
    { label: 'TL_REJECTED_LABEL', value: 'Rejected' },
    { label: 'SYSTEM_ERROR_TEXT', value: 'SystemError' },
    { label: 'NO_RESPONSE_TEXT', value: 'NoResponse' },
  ];
  createMethodOptions = [
    { label: 'All', value: 'All' },
    { label: 'PAY_NOW', value: 'PayNow' },
    { label: 'QUICK_PAY_C_TEXT', value: 'QuickPay-C' },
    { label: 'WEEKLY_PGM', value: 'AutoPay' },
    { label: 'QUICK_PAY_E_TEXT', value: 'QuickPay-E' },
  ];
  sentToSAPOptions = [
    { label: 'All', value: 'All' },
    { label: 'SUCCESS_TEXT', value: 'SUCCESS' },
    { label: 'FAIL_TEXT', value: 'FAIL' },
    { label: 'UNSENT_TEXT', value: 'UNSENT' },
  ];
  isSuccessfulSearch = false;
  showZeroResultsMessage = false;
  showZeroFieldsError = false;
  CURRENT_VALUE = -1;
  HISTORY_VALUE = -1;
  currentTransictionsBatch: any = [];
  p: number = 1;

  constructor(
    private fb: FormBuilder,
    public translate: TranslateService,
    private adminTransLogService: AdminTransactionLogService,
    private obbpLoginService: OBPPLoginService,
    private currencyPipe: CurrencyPipe,
    private dataSharingService: DataSharingService
  ) {
    this.transactionLogSearchForm = this.fb.group({
      accountNumber: [
        '',
        [
          Validators.pattern('^[a-zA-Z0-9]{2,15}((,[a-zA-Z0-9]{2,15})*)$'),
          Validators.maxLength(50),
        ],
      ],
      name: ['', [Validators.maxLength(50)]],
      cardHolderName: [
        '',
        [
          Validators.pattern("^[a-zA-Z0-9.'\\-_\\s]*$"),
          Validators.maxLength(50),
        ],
      ],
      referenceNumber: [
        '',
        [
          Validators.pattern('^[a-zA-Z0-9]+$'),
          Validators.minLength(6),
          Validators.maxLength(6),
        ],
      ],
      payerName: ['', [Validators.maxLength(25)]],
      invoiceNumber: [
        '',
        [
          Validators.pattern('^[0-9]{1,12}((,[0-9]{1,12})*)$'),
          Validators.maxLength(50),
        ],
      ],
      shipmentPin: ['', [Validators.pattern('^[a-zA-Z0-9]*$')]],
      searchDuration: ['CURRENT'],
      dateFrom: [''],
      dateTo: [''],
      amountFrom: [''],
      amountTo: [''],
      creditCardType: [''],
    });
    this.$transactionLogMetaData = this.adminTransLogService
      .getTransactionLogMetaData(obbpLoginService.x_csrf_token)
      .pipe(
        map((data) => {
          if (
            data?.serviceResponse?.type === 'success' &&
            data?.serviceResponse?.object
          ) {
            let currentMonths = parseInt(data.serviceResponse.object.CURRENT);
            this.HISTORY_VALUE = parseInt(data.serviceResponse.object.HISTORY);
            this.CURRENT_VALUE = currentMonths;
            this.changeDates({ target: { value: 'CURRENT' } });
            return data.serviceResponse.object;
          } else {
            console.error('not data available');
          }
        }),
        catchError((err) => {
          return err;
        })
      );
  }

  onSort({ column, direction }: SortEvent) {
    this.headers?.forEach(header => {
      header.direction = header.sortable === column ? direction : '';
    });
    if (direction && column) {
      this.transactionsAll = [...this.transactionsAll].sort((a, b) => {
        const valueA = a[column];
        const valueB = b[column];
        if (valueA == null && valueB == null) return 0;
        if (valueA == null) return direction === 'asc' ? 1 : -1;
        if (valueB == null) return direction === 'asc' ? -1 : 1;
        const res = (typeof valueA === 'number' && typeof valueB === 'number') ? 
                    valueA - valueB : 
                    valueA.toString().localeCompare(valueB.toString());
        return direction === 'asc' ? res : -res;
      });
    }
  }

  onSortAdvanced({ column, direction }: SortEvent) {
    this.headers?.forEach(header => {
        header.direction = (header.sortable === column) ? direction : '';
    });
    if (direction && column) {
      this.transactionsAll = [...this.transactionsAll].sort((a, b) => {
        const valueA = a[column] ?? '';
        const valueB = b[column] ?? '';
        let i = 0, j = 0, result = 0;
        let partA, partB;
        while (result === 0 && i < valueA.length && j < valueB.length) {
          [partA, i] = extractPart(valueA, i);
          [partB, j] = extractPart(valueB, j);

          const isNumberA = !isNaN(Number(partA));
          const isNumberB = !isNaN(Number(partB));

          if (isNumberA && isNumberB) {
            result = Number(partA) - Number(partB);
          } else {
            result = partA.localeCompare(partB);
          }
        }
        if (result === 0) {
          result = valueA.length - valueB.length;
        }
        return direction === 'asc' ? result : -result;
      });
    }
  }

  objectToArray(object: any) {
    return Object.keys(object);
  }

  isNotEmpty(value: any) {
    return (
      this.transactionLogSearchForm.get(value)?.value &&
      typeof this.transactionLogSearchForm.get(value)?.value === 'string' &&
      this.transactionLogSearchForm.get(value)?.value.replace(/\s/g, '') != ''
    );
  }

  performSearch() {
    let isValid = this.transactionLogSearchForm?.valid;
    if (isValid) {
      if (
        !(
          this.isNotEmpty('accountNumber') ||
          this.isNotEmpty('invoiceNumber') ||
          this.isNotEmpty('amountFrom') ||
          this.isNotEmpty('amountTo') ||
          this.isNotEmpty('shipmentPin') ||
          this.transactionLogSearchForm.get('dateFrom')?.value ||
          this.transactionLogSearchForm.get('dateTo')?.value
        )
      ) {
        this.showZeroFieldsError = true;
        return;
      }
      this.showZeroFieldsError = false;
      let searchData = {
        creditCardType: this.transactionLogSearchForm.get('creditCardType')
          ?.value
          ? this.transactionLogSearchForm.get('creditCardType')?.value
          : this.changeCreditTypeDefaultValue,
        duration: this.transactionLogSearchForm.get('searchDuration')?.value,
        accountNumber:
          this.transactionLogSearchForm.get('accountNumber')?.value,
        accountName: this.transactionLogSearchForm.get('name')?.value,
        paymentType: this.transactionLogSearchForm.get('creditCardType')?.value
          ? this.transactionLogSearchForm.get('creditCardType')?.value
          : this.changeCreditTypeDefaultValue,
        cardHolderName:
          this.transactionLogSearchForm.get('cardHolderName')?.value,
        referenceNumber:
          this.transactionLogSearchForm.get('referenceNumber')?.value,
        payerName: this.transactionLogSearchForm.get('payerName')?.value,
        invoiceNumber:
          this.transactionLogSearchForm.get('invoiceNumber')?.value,
        shipmentPin: this.transactionLogSearchForm.get('shipmentPin')?.value,
        amountFrom: this.extractActualAmountValue(
          this.transactionLogSearchForm.get('amountFrom')?.value
        ),
        amountTo: this.extractActualAmountValue(
          this.transactionLogSearchForm.get('amountTo')?.value
        ),
        dateFromCal: this.formatDateToDateTime(
          this.transactionLogSearchForm.get('dateFrom')?.value
        ),
        dateToCal: this.formatDateToDateTime(
          this.transactionLogSearchForm.get('dateTo')?.value
        ),
        dateFrom: this.formatDateToDateZero(
          this.transactionLogSearchForm.get('dateFrom')?.value
        ),
        dateTo: this.formatDateToDateZero(
          this.transactionLogSearchForm.get('dateTo')?.value
        ),
        userRole: 'Administrator',
      };
      this.dataSharingService.IsLoadingEnabled.next(true);
      this.adminTransLogService
        .submitTransactionLogData(
          searchData,
          this.obbpLoginService.x_csrf_token
        )
        .subscribe({
          next: (data: any) => {
            if (data?.serviceResponse?.type === 'success') {
              this.transactions = data.serviceResponse.object;
              this.transactionsAll = data.serviceResponse.object;
              this.transactionsAll.forEach((traLog:any)=>{
                traLog.invoiceDateTime= traLog.invoiceDateTime?.slice(0,-6);
               });
              this.isSuccessfulSearch = true;
              this.showZeroResultsMessage = false;
              this.dataSharingService.IsLoadingEnabled.next(false);
              return data.serviceResponse.object;
            } else if (
              data?.serviceResponse?.type === 'error' &&
              data?.serviceResponse?.message === 'NO_TRANSACTIONS_FOUND'
            ) {
              this.transactions = [];
              this.transactionsAll = [];
              this.isSuccessfulSearch = false;
              this.showZeroResultsMessage = true;
              this.dataSharingService.IsLoadingEnabled.next(false);
            } else {
              this.showZeroResultsMessage = true;
              this.dataSharingService.IsLoadingEnabled.next(false);
            }
          },
          error: (error: any) => {
            this.isSuccessfulSearch = false;
            this.dataSharingService.IsLoadingEnabled.next(false);
          },
        });
      this.paymentTypeDefaultValue = 'All';
      this.paymentStatusDefaultValue = 'All';
      this.createdMethodeDefaultValue = 'All';
      this.sendToSAPDefaultValue = 'All';
    }
  }

  formatMoney(value: string) {
    const temp = `${value}`.replace(/\,/g, '');
    return this.currencyPipe.transform(temp)?.replace('$', '');
  }

  formatDateToDateTime(value: any) {
    if (value) {
      return (
        value.year +
        '-' +
        this.evalSingleDigit(value.month) +
        '-' +
        this.evalSingleDigit(value.day) +
        'T04:00:00.000Z'
      );
    }
    return value;
  }

  formatDateToDateZero(value: any) {
    if (value) {
      return (
        value.year +
        '' +
        this.evalSingleDigit(value.month) +
        '' +
        this.evalSingleDigit(value.day) +
        '000000'
      );
    }
    return value;
  }

  evalSingleDigit(value: any) {
    return value < 10 ? '0' + value : value;
  }

  extractActualAmountValue(value: string) {
    if (value) {
      return value.replace(',', '');
    }
    return value;
  }

  transformTotal(event: any) {
    const value = this.transactionLogSearchForm.get(event.target.name)?.value;
    this.transactionLogSearchForm
      .get(event.target.name)
      ?.setValue(this.formatMoney(value.replace(/\,/g, '')), {
        emitEvent: false,
      });
  }

  changeCreditTypeValue(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.changeCreditTypeDefaultValue = filterValue;
    this.transactionLogSearchForm.get('creditCardType')?.setValue(filterValue);
  }

  filterTransictions({
    event,
    type,
    filterInput,
  }: {
    event?: Event;
    type: string;
    filterInput?: string;
  }) {
    
    this.transactionsAll = this.transactions
    const filterValue = event
      ? (event.target as HTMLInputElement).value
      : filterInput || '';
    switch (type) {
      case 'paymentType':
        this.paymentTypeDefaultValue =
          filterValue.toLowerCase() === 'mastercard' ? 'master' : filterValue;
        break;
      case 'paymentStatus':
        this.paymentStatusDefaultValue = filterValue;
        break;
      case 'createMethod':
        this.createdMethodeDefaultValue = filterValue;
        break;
      case 'sendToSAP':
        this.sendToSAPDefaultValue = filterValue;
        break;
    }
    if (this.transactionsAll?.length > 0 && filterValue) {
      const filteredPaymentStatus =
        this.paymentStatusDefaultValue === 'All'
          ? this.transactionsAll
          : this.transactionsAll.filter((element: any) => {
              return (
                element.paymentStatus.toLowerCase() ===
                this.paymentStatusDefaultValue.toLowerCase()
              );
            });

      const filteredByPaymentType =
        this.paymentTypeDefaultValue === 'All'
          ? filteredPaymentStatus
          : filteredPaymentStatus.filter((element: any) => {
              return (
                element.paymentType &&
                element.paymentType.toLowerCase() ===
                  this.paymentTypeDefaultValue.toLowerCase()
              );
            });

      const filteredByCreateMethod =
        this.createdMethodeDefaultValue === 'All'
          ? filteredByPaymentType
          : filteredByPaymentType.filter((element: any) => {
              return (
                element.createMethod &&
                element.createMethod.toLowerCase() ===
                  this.createdMethodeDefaultValue.toLowerCase()
              );
            });

      const filteredBySendToSAP =
        this.sendToSAPDefaultValue === 'All'
          ? filteredByCreateMethod
          : filteredByCreateMethod.filter((element: any) => {
              return (
                element.sentToSAP &&
                element.sentToSAP.toLowerCase() ===
                  this.sendToSAPDefaultValue.toLowerCase()
              );
            });
      this.transactionsAll = filteredBySendToSAP;
      this.p=0;
    }
  }

  resetForm() {
    this.transactionLogSearchForm.reset();
    this.transactionLogSearchForm.get('searchDuration')?.setValue('CURRENT');
    this.showZeroResultsMessage = false;
    this.showZeroFieldsError = false;
    this.transactions = [];
    this.transactionsAll = [];
    this.changeCreditTypeDefaultValue = 'ALL';
    this.isSuccessfulSearch = false;
  }

  changeDates(event: any) {
    let value = event.target.value;
    const current = new Date();
    if (value == 'CURRENT') {
      current.setMonth(current.getMonth() - this.CURRENT_VALUE);
    } else {
      current.setMonth(current.getMonth() - this.HISTORY_VALUE);
    }
    this.minDate.year = current.getFullYear();
    this.minDate.day = current.getDate();
    this.minDate.month = current.getMonth() + 1;
    this.minToDate.year = current.getFullYear();
    this.minToDate.day = current.getDate();
    this.minToDate.month = current.getMonth() + 1;
  }

  exportedToSheet() {
    const maxCellLength = 32767;
    function splitLongText(text:any) {
      if (!text) return [null];
      const parts = [];
      while (text.length > 0) {
        parts.push(text.substring(0, maxCellLength));
        text = text.substring(maxCellLength);
      }
      return parts;
    }
    const rows: { [key: string]: string | null }[] = [];
    this.transactions.forEach((transaction: any) => {
      let shipmentPinAmount = transaction.transactionLogDetailsDTOList
        ? transaction.transactionLogDetailsDTOList
          .map((t: { pinNumber: string; pinAmountPaid: number }) => `${t.pinNumber}-${t.pinAmountPaid}$`)
          .join('  ')
        : null;
      const splitShipmentPinAmount = splitLongText(shipmentPinAmount);
      splitShipmentPinAmount.forEach((part, index) => {
        const row: { [key: string]: string | null } = {
          'Account #': index === 0 ? transaction.accountNumber : '',
          'Invoice #': index === 0 ? transaction.invoiceNumber : '',
          'Invoice Payment Amount': index === 0 ? transaction.invoiceAmount : '',
          'Invoice Date': index === 0 ? transaction.invoiceDateTime : '',
          'Payment Date': index === 0 ? transaction.paymentDateTime : '',
          'Total Payment Amount': index === 0 ? transaction.paymentAmount : '',
          'Currency': index === 0 ? transaction.invoiceCurrency : '',
          'Payment Type': index === 0 ? transaction.paymentType : '',
          'CC#': index === 0 ? transaction.ccLastDigits : '',
          'Shipment PIN/Amount': part,
          'Payer/Cardholder': index === 0 ? transaction.payerName : '',
          'Ref #': index === 0 ? transaction.referenceNumber : '',
          'Email Sent': index === 0 ? transaction.emailSend : '',
          'Account Name': index === 0 ? transaction.accountName : '',
          Type: index === 0 ? transaction.createMethod : '',
          'User ID': index === 0 ? transaction.userid : '',
          'Payment ID': index === 0 ? transaction.paymentID : '',
          'Sent To SAP': index === 0 ? transaction.sentToSAP : '',
          'B/L': index === 0 ? transaction.shipmentPin : '',
          'Payment Transaction ID': index === 0 ? transaction.paymentTransactionID : '',
          'Payment Status': index === 0 ? transaction.paymentStatus : '',
        };
        rows.push(row);
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = {
      Sheets: { data: worksheet },
      SheetNames: ['data']
    };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, 'Transaction_log_export_' + new Date().toISOString() + EXCEL_EXTENSION);
  }
}
function extractPart(str:any, index:any) {
  let part = '';
  const isDigit = (c: any) => c >= '0' && c <= '9';
  const currentIsDigit = isDigit(str[index]);
  while (index < str.length && isDigit(str[index]) === currentIsDigit) {
      part += str[index++];
  }
  return currentIsDigit ? [parseFloat(part), index] : [part, index];
}
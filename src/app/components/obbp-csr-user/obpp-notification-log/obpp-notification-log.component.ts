import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map } from 'rxjs';
import {
  NgbdSortableHeader,
  SortEvent,
} from 'src/app/common/bootstrap-sortable-header/sortable-header.directive';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';
import { AdminNotificationLogService } from 'src/app/services/admin-notification-log/admin-notification-log.services';
import { OBPPModalDialogComponent } from '../../error-component/modal-dialog/modal-dialog.component';

const compare = (v1: string | number, v2: string | number) =>
  v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
const now = new Date();
const lessThan2years = new Date();
lessThan2years.setFullYear(now.getFullYear() - 2);
@Component({
  selector: 'app-obpp-notification-log',
  templateUrl: './obpp-notification-log.component.html',
  styleUrls: ['./obpp-notification-log.component.css'],
})
export class ObppNotificationLogComponent implements OnInit {
  @ViewChildren(NgbdSortableHeader) headers?: QueryList<NgbdSortableHeader>;
  @ViewChild('markNotificationItem') markNotificationItem: ElementRef | undefined;
  @ViewChild('markAll') markAll: ElementRef | undefined;
  notificationLogSearchForm: FormGroup;
  notificationLogArrayForm: FormGroup;
  notifications: any = [];
  notificationsAll: any = [];
  $notificationLogMetaData;
  minDate = {
    year: lessThan2years.getFullYear(),
    month: lessThan2years.getMonth() + 1,
    day: lessThan2years.getDate(),
  };
  maxDate = {
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
  isSuccessfulSearch = false;
  showZeroResultsMessage = false;
  showZeroFieldsError = false;
  notificationTypeDefaultValue = '';
  selectData: any = new Map();
  notificationTypes = [
    { id: '1', name: 'All' },
    { id: '2', name: 'Completed' },
    { id: '3', name: 'Failed' },
    { id: '4', name: 'Error' },
  ];
  notificationTypeFilterDefaultValue = this.notificationTypes[0].name;
  showEmptyCheckBoxError = false;
  showInvalidEmailAddress = false;
  showInvalidEmailAddressCount = false;
  selectedCount = 0;
  emailRegex =
    '[a-zA-Z0-9_+S-]*(?=[a-zA-Z0-9](?![.]{2}).+)([a-zA-Z0-9_+.S-])*([a-zA-Z0-9-S_+S-]+)\\@(([a-zA-Z0-9-S])+\\.)+([a-zA-Z0-9S]{2,10})';
  submitted: boolean = false;
  sortDirection: string = '';

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private router: Router,
    public translate: TranslateService,
    private adminNotifyLogService: AdminNotificationLogService,
    private obbpLoginService: OBPPLoginService
  ) {
    this.notificationLogSearchForm = this.fb.group({
      emailAddress: [
        '',
        [Validators.required, Validators.pattern('^' + this.emailRegex + '$')],
      ],
      dateFrom: ['', [Validators.required]],
      dateTo: ['', [Validators.required]],
      notificationKeyword: ['', [Validators.maxLength(100)]],
      notificationType: ['', [Validators.required]],
    });
    this.notificationLogArrayForm = this.fb.group({
      notificationLogArrayDetails: this.fb.array([]),
    });

    this.$notificationLogMetaData = this.adminNotifyLogService
      .getNotificationLogMetaData(obbpLoginService.x_csrf_token)
      .pipe(
        map((data) => {
          if (
            data?.serviceResponse?.type === 'success' &&
            data?.serviceResponse?.object
          ) {
            for (let i = 0; i < data.serviceResponse.object.length; i++) {
              this.selectData.set(
                data.serviceResponse.object[i].templateID,
                data.serviceResponse.object[i].templateTypeName
              );
            }
            return data.serviceResponse.object;
          }
        }),
        catchError((err) => {
          return err;
        })
      );
  }

  markNotificationItemSelectiononEnter(index: number, event: any){
    event.preventDefault(); 
    if (this.markNotificationItem) {
      
      this.markNotificationItem.nativeElement.checked = !this.markNotificationItem.nativeElement.checked;
      this.markNotificationItemSelection(index,event);
    }
  }

  markAllNotifications(event:any){
    event.preventDefault(); 
    if (this.markAll) {
      
      this.markAll.nativeElement.checked = !this.markAll.nativeElement.checked;
      this.markAllNotificationsSelection(event);
    }

  }
  createNotificationEditFormGroup(email: string) {
    return this.fb.group({
      recipientEmailAddresses: [
        email,
        [
          Validators.required,
          Validators.pattern(
            '^' + this.emailRegex + '((;' + this.emailRegex + ')*)$'
          ),
          Validators.maxLength(250),
        ],
      ],
      isSelected: [false, [Validators.required]],
    });
  }

  get notificationEditFormGroup(): FormArray {
    return this.notificationLogArrayForm.get(
      'notificationLogArrayDetails'
    ) as FormArray;
  }

  ngOnInit(): void {
    this.notificationLogSearchForm.get('notificationType')?.setValue(140);
    this.notificationTypeDefaultValue = 'Account Removed from AutoPay';
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
      this.notifications = [...this.notifications].sort((a, b) => {
        const res = compare(a[column], b[column]);
        if ((direction === 'asc')) {
          this.sortDirection = 'Earliest Notification date';
        } else {
          this.sortDirection = 'Latest Notification date';
        }
        return direction === 'asc' ? res : -res;
      });
    }
  }

  objectToArray(object: any) {
    return Object.keys(object);
  }

  isNotEmpty(value: any) {
    return (
      this.notificationLogSearchForm.get(value)?.value &&
      typeof this.notificationLogSearchForm.get(value)?.value === 'string' &&
      this.notificationLogSearchForm.get(value)?.value.replace(/\s/g, '') != ''
    );
  }

  performSearch() {
    this.submitted = true;
    let isValid = this.notificationLogSearchForm?.valid;
    if (
      isValid &&
      this.notificationTypeDefaultValue &&
      this.notificationTypeDefaultValue.length > 1
    ) {
      let searchData = {
        recipientEmailAddress:
          this.notificationLogSearchForm.get('emailAddress')?.value,
        notificationDateSearchFromFE: this.formatDateToDateTime(
          this.notificationLogSearchForm.get('dateFrom')?.value
        ),
        notificationDateSearchEndFE: this.formatDateToDateTime(
          this.notificationLogSearchForm.get('dateTo')?.value
        ),
        notificationDateSearchFrom: this.formatDateToDateZero(
          this.notificationLogSearchForm.get('dateFrom')?.value
        ),
        notificationDateSearchEnd: this.formatDateToDateZero(
          this.notificationLogSearchForm.get('dateTo')?.value
        ),
        notificationKeywordSearch: this.notificationLogSearchForm.get(
          'notificationKeyword'
        )?.value,
        notificationType: this.notificationTypeDefaultValue,
        templateID:
          this.notificationLogSearchForm.get('notificationType')?.value,
      };

      this.adminNotifyLogService
        .submitNotificationLogData(
          searchData,
          this.obbpLoginService.x_csrf_token
        )
        .subscribe({
          next: (data: any) => {
            if (data?.serviceResponse?.type === 'success') {
              this.notifications = data.serviceResponse.object;
              this.notificationsAll = data.serviceResponse.object;
              this.notificationEditFormGroup.clear();
              for (let i = 0; i < this.notifications.length; i++) {
                this.notificationEditFormGroup.controls.push(
                  this.createNotificationEditFormGroup(
                    this.notifications[i].recipientEmailAddress
                  )
                );
              }
              if (this.notifications.length > 0) {
                this.isSuccessfulSearch = true;
                this.showZeroResultsMessage = false;
              } else {
                this.isSuccessfulSearch = false;
                this.showZeroResultsMessage = true;
              }
              return data.serviceResponse.object;
            } else if (
              data?.serviceResponse?.type === 'error' &&
              data?.serviceResponse?.message === 'NO_TRANSACTIONS_FOUND'
            ) {
              this.notifications = [];
              this.notificationsAll = [];
              this.isSuccessfulSearch = false;
              this.showZeroResultsMessage = true;
            } else {
              this.showZeroResultsMessage = true;
            }
          },
          error: (error: any) => {
            this.isSuccessfulSearch = false;
          },
        });
    }
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

  changeResultsView(event: any, filterValue: string) {
    if (this.notificationsAll && this.notificationsAll.length > 0) {
      this.notifications = this.notificationsAll.filter(
        (element: any, index: any, array: any) => {
          return element.paymentStatus === filterValue;
        }
      );
    }
  }

  resetForm() {
    this.notificationLogSearchForm.reset();
    this.showZeroResultsMessage = false;
    this.showZeroFieldsError = false;
    this.notifications = [];
    this.notificationsAll = [];
    this.isSuccessfulSearch = false;
    this.notificationTypeFilterDefaultValue = this.notificationTypes[0].name;
    this.showEmptyCheckBoxError = false;
    this.showInvalidEmailAddress = false;
    this.showInvalidEmailAddressCount = false;
    this.notificationTypeDefaultValue = '';
    this.selectedCount = 0;
  }

  filterNotificationTypeValue(value: string) {
    this.notificationTypeFilterDefaultValue = value;
    if (this.notificationsAll && this.notificationsAll.length > 0 && value) {
      this.notificationEditFormGroup.clear();
      this.notifications = this.notificationsAll.filter(
        (element: any, index: any, array: any) => {
          let result =
            element.status &&
            (element.status.toLowerCase() === value.toLowerCase() ||
              value == 'All');
          if (result) {
            this.notificationEditFormGroup.controls.push(
              this.createNotificationEditFormGroup(
                this.notificationsAll[index].recipientEmailAddress
              )
            );
          }
          return result;
        }
      );
      this.notificationEditFormGroup.updateValueAndValidity({
        emitEvent: true,
      });
    }
  }

  changeNotificationTypeValue(value: any) {
    const notification = value.split(',');
    this.notificationTypeDefaultValue = notification[1];
    this.notificationLogSearchForm
      .get('notificationType')
      ?.setValue(Number(notification[0]));
  }

  resendNotificationMail() {
    if (this.selectedCount > 0) {
      this.showEmptyCheckBoxError = false;
      this.showInvalidEmailAddress = false;
      this.showInvalidEmailAddressCount = false;
      let requestData = [];
      for (let i = 0; i < this.notificationEditFormGroup.controls.length; i++) {
        if (
          this.notificationEditFormGroup.controls[i].get('isSelected')?.value
        ) {
          if (this.notificationEditFormGroup.controls[i].valid) {
            let recipientEmailAddresses =
              this.notificationEditFormGroup.controls[i].get(
                'recipientEmailAddresses'
              )?.value;
            if (
              recipientEmailAddresses &&
              recipientEmailAddresses.split(';').length > 2
            ) {
              this.showInvalidEmailAddressCount = true;
              return;
            }
            let newData = Object.assign({}, this.notifications[i]);
            newData.createBy = this.obbpLoginService.getUserName();
            newData.updateBy = this.obbpLoginService.getUserName();
            newData.parameter = null
            newData.recipientEmailAddress =
              this.notificationEditFormGroup.controls[i].get(
                'recipientEmailAddresses'
              )?.value;
            requestData.push(newData);
          } else {
            this.showInvalidEmailAddress = true;
            return;
          }
        }
      }
      if (requestData.length > 0) {
        this.adminNotifyLogService
          .resendNotificationMail(
            requestData,
            this.obbpLoginService.getAuthToken()
          )
          .subscribe({
            next: (data: any) => {
              if (data?.serviceResponse?.type === 'success') {
                const modalRef = this.modalService.open(
                  OBPPModalDialogComponent
                );
                modalRef.componentInstance.my_modal_title = 'TL_EMAIL_SENT_LABEL';
                modalRef.componentInstance.my_modal_content =
                  'RESEND_NOTIFICATION_CONFIRMATION';
                modalRef.componentInstance.firstButtonLabel = 'OK';
                modalRef.componentInstance.modalType = 'warning';
                modalRef.componentInstance.successAction.subscribe(
                  ($e: any) => {
                    this.reloadCurrentRoute();
                  }
                );
              }
            },
            error: (error: any) => {
              this.isSuccessfulSearch = false;
            },
          });
      }
    } else {
      this.showEmptyCheckBoxError = true;
    }
  }

  reloadCurrentRoute() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  markNotificationItemSelection(index: number, event: any) {
    if (event.target.checked) {
      this.selectedCount++;
    } else {
      this.selectedCount--;
    }
  }

  markAllNotificationsSelection(event: any) {
    for (let i = 0; i < this.notificationEditFormGroup.controls.length; i++) {
      this.notificationEditFormGroup.controls[i]
        .get('isSelected')
        ?.setValue(event.target.checked);
    }
    this.selectedCount = event.target.checked
      ? this.notificationEditFormGroup.controls.length
      : 0;
  }

  convertStringDateTime(strValue: string) {
    const year = Number(strValue.substring(0, 4));
    const month = Number(strValue.substring(4, 6)) - 1;
    const day = Number(strValue.substring(6, 8));
    const hour = Number(strValue.substring(8, 10));
    const minute = Number(strValue.substring(10, 12));
    const second = Number(strValue.substring(12));
    return new Date(year, month, day, hour, minute, second);
  }
}

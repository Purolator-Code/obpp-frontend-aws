import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  AutoPayUserAccount,
  EnrollAutoPay,
} from 'src/app/common/models/enrollAutopay';
import { EnrollAutopayService } from 'src/app/services/enroll-autopay/enroll-autopay.service';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';
import { OBPPModalDialogComponent } from '../../error-component/modal-dialog/modal-dialog.component';

@Component({
  selector: 'app-obpp-autopay',
  templateUrl: './obpp-autopay.component.html',
  styleUrls: ['./obpp-autopay.component.css'],
})
export class ObppAutopayComponent {
  serviceData = new Map();
  creditCardServiceData = new Map();
  showRegisterOption = false;
  creditCardDetails: any;
  autopayList: any;
  creditCardList: any;
  enrollAutoPayForm: FormGroup;
  disableAddAccount = false;
  showNextPage = false;
  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private enrollAutoPayService: EnrollAutopayService,
    private obppAuthService: OBPPLoginService,
    private router: Router
  ) {
    enrollAutoPayService
      .fetchCurrentCreditCardList(
        '',
        obppAuthService.x_csrf_token
      )
      .subscribe((creditData: any) => {
        if (creditData?.serviceResponse?.type === 'success') {
          this.creditCardDetails = creditData.serviceResponse.object;
          this.autopayList =
            creditData.serviceResponse.object.autoPayAccountDtoList;
          this.creditCardList =
            creditData.serviceResponse.object.creditCardDtoList;
        }
      });
    this.enrollAutoPayForm = this.fb.group({
      accountDetails: this.fb.array(
        [this.createEmpFormGroup()],
        [Validators.required, Validators.minLength(1), Validators.maxLength(5)]
      ),
    });
  }

  get accountDetails(): FormArray {
    return this.enrollAutoPayForm.get('accountDetails') as FormArray;
  }

  createEmpFormGroup() {
    return this.fb.group({
      accountNumber: ['', [Validators.required]],
      accountNumberOriginal: [''],
      postalCode: [''],
      expectedPostalCode: '',
      paymentDate: [''],
      autoPayFlag: [false, [Validators.required]],
      emailNotificationId: ['', [Validators.email]],
      isPreloaded: false,
      isPostalCodeDisabled: true,
    });
  }

  createEmpFormGroupWithValue(
    accNum: string,
    paymentDate: string,
    autoPayFlag: boolean,
    emailNotificationId: string
  ) {
    return this.fb.group({
      accountNumber: [accNum, [Validators.required]],
      accountNumberOriginal: [accNum],
      postalCode: [''],
      expectedPostalCode: '',
      paymentDate: [paymentDate],
      autoPayFlag: [autoPayFlag, [Validators.required]],
      emailNotificationId: [emailNotificationId, [Validators.email]],
      isPreloaded: true,
      isPostalCodeDisabled: true,
    });
  }

  remove(itemId: any) {
    const modalRef = this.modalService.open(OBPPModalDialogComponent);
    modalRef.componentInstance.my_modal_title = 'REM_ACCT_CONF_TEXT';
    modalRef.componentInstance.my_modal_content = 'REMOVE_ACCT_SURE_CONF_TEXT';
    modalRef.componentInstance.firstButtonLabel = 'REMOVE_ACCT_CONF_TEXT';
    modalRef.componentInstance.secondButtonLabel = 'CANCEL';
    modalRef.componentInstance.modalType = 'warning';

    modalRef.componentInstance.successAction.subscribe(($e: any) => {
      this.accountDetails.controls.splice(itemId, 1);
      if (this.accountDetails.controls.length == 0) {
        this.accountDetails.controls.push(this.createEmpFormGroup());
      }
    });
  }

  creditCardLoad(creditCardId: string) {
    if (this.autopayList) {
      this.accountDetails.clear();
      let i = 0;
      this.fetchCreditCardDetails(creditCardId);
      for (let autopayaccount of this.autopayList) {
        if (autopayaccount.creditcardid === creditCardId) {
          this.accountDetails.controls.push(
            this.createEmpFormGroupWithValue(
              autopayaccount.accountNumber,
              autopayaccount.targetActionDateFrontEnd,
              autopayaccount.sendSuccessfullNotificationInd,
              autopayaccount.carbonCopyEmailAddress
            )
          );
          this.accountDetails.updateValueAndValidity({ emitEvent: true });
          i++;
        }
      }
      this.disableAddAccount = false;
    }
  }

  accountNumberLoad(accountNumber: string) {
    if (this.autopayList) {
      this.accountDetails.clear();
      let i = 0;
      for (let autopayaccount of this.autopayList) {
        if (autopayaccount.accountNumber === accountNumber) {
          this.accountDetails.controls.push(
            this.createEmpFormGroupWithValue(
              autopayaccount.accountNumber,
              autopayaccount.targetActionDateFrontEnd,
              autopayaccount.sendSuccessfullNotificationInd,
              autopayaccount.carbonCopyEmailAddress
            )
          );
          this.disableAddAccount = true;
          this.checkAccountNumber(i);
          i++;
        }
      }
      this.accountDetails.updateValueAndValidity({ emitEvent: true });
    }
  }

  selectCheckBox(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const checkbox = event.target as HTMLInputElement;
    checkbox.click();
  }

  checkPostalCode(index: any) {
    const isValid =
      this.accountDetails.controls[index].get('postalCode')?.valid;
    const expectedPostalCode =
      this.accountDetails.controls[index].get('expectedPostalCode')?.value;
    if (isValid) {
      if (!expectedPostalCode) {
        this.checkAccountNumber(index);
      }
    }
  }

  fetchCreditCardDetails(cardId: string) {
    if (cardId) {
      if (!this.creditCardServiceData.get(cardId)) {
        this.enrollAutoPayService.fetchAccountDetailsByCardId(cardId).subscribe(
          (accountData: any) => {
            if (accountData?.serviceResponse?.type === 'success') {
              this.creditCardServiceData.set(
                cardId,
                accountData.serviceResponse.type.object
              );
              for (
                let i = 0;
                i < accountData.serviceResponse.object.length;
                i++
              ) {
                this.serviceData.set(
                  accountData.serviceResponse.object[i].accountNumber,
                  accountData.serviceResponse.object[i]
                );
              }
            }
          },
          (error: any) => {
            console.error(error);
          }
        );
      }
    }
  }

  checkAccountNumber(index: any) {
    let isValid =
      this.accountDetails.controls[index].get('accountNumber')?.valid;
    let accountNumber =
      this.accountDetails.controls[index].get('accountNumber')?.value;
    if (
      isValid === true &&
      this._checkIfAccountNumberExists(accountNumber) === false
    ) {
      this.enrollAutoPayService.checkAccountNumber(accountNumber).subscribe(
        (data: any) => {
          if (data?.serviceResponse?.type === 'success') {
            if (
              data?.serviceResponse?.object?.accountNumber &&
              data?.serviceResponse?.object?.scheduledNextInvoiceDate
            ) {
              let dateString =
                data.serviceResponse.object.scheduledNextInvoiceDate;
              let newString =
                dateString.substr(4, 2) +
                '-' +
                dateString.substr(6, 2) +
                '-' +
                dateString.substr(0, 4);
              this.accountDetails.controls[index]
                .get('paymentDate')
                ?.setValue(newString);
              const postalcode =
                data.serviceResponse.object.accountBillingPostcode
                  .replace(/ /g, '')
                  .toLowerCase();
              this.accountDetails.controls[index]
                .get('expectedPostalCode')
                ?.setValue(postalcode);
              this.enrollAutoPayService.fetchAccountId(accountNumber).subscribe(
                (accountData: any) => {
                  if (accountData?.serviceResponse?.type === 'success') {
                    data.serviceResponse.object.accountID =
                      accountData.serviceResponse.object;
                    this.serviceData.set(
                      accountNumber,
                      data.serviceResponse.object
                    );
                  }
                }
              );

              this.enrollAutoPayService
                .fetchAccountStatus(accountNumber)
                .subscribe(
                  (accountData: any) => {
                    if (accountData?.serviceResponse?.type === 'success') {
                      data.serviceResponse.object.obppAutoPayAccountStatus =
                        accountData.serviceResponse.object.obppAutoPayAccountStatus;
                      data.serviceResponse.object.obppAutoPayAccountOwnerID =
                        accountData.serviceResponse.object.obppAutoPayAccountOwnerID;
                      this.serviceData.set(
                        accountNumber,
                        data.serviceResponse.object
                      );
                    }
                  }
                );
              return;
            }
          }
        }
      );
    }
  }

  _checkIfAccountNumberExists(accountNumber: string): boolean {
    return this.serviceData.get(accountNumber) != (undefined || null);
  }

  addAccount() {
    this.accountDetails.controls.push(this.createEmpFormGroup());
  }

  _convertDateToFrontEnddate(dateString: string): string {
    if (dateString === null || dateString === undefined || dateString === '')
      return '';
    return dateString.substring(0, 8);
  }

  register() {
    let isEnrollPayValid = this.enrollAutoPayForm?.valid;
    let isAccountDetailsValid = this.accountDetails?.valid;
    if (isEnrollPayValid && isAccountDetailsValid) {
      let isBusinessValid = true;
      let enrollAutoPay = new EnrollAutoPay();
      let accountNumbers: string[] = [];
      enrollAutoPay.userName = '';

      if (isBusinessValid) {
        for (let index = 0; index < this.accountDetails.length; index++) {
          if (this.accountDetails.controls[index]?.valid === false) {
            break;
          } else if (
            accountNumbers.includes(
              this.accountDetails.controls[index].get('accountNumber')?.value
            ) === true
          ) {
            break;
          } else {
            let autopayUserAcc = new AutoPayUserAccount();
            let serviceData: any = this.serviceData.get(
              this.accountDetails.controls[index].get('accountNumber')?.value
            );
            autopayUserAcc.accountID = serviceData.accountID;
            autopayUserAcc.creditcardid = serviceData.creditcardid
              ? serviceData.creditcardid
              : '';
            autopayUserAcc.accountNumber = serviceData.accountNumber;
            autopayUserAcc.obppAutoPayAccountStatus =
              serviceData.obppAutoPayAccountStatus;
            autopayUserAcc.sendSuccessfullNotificationInd =
              this.accountDetails.controls[index].get('autoPayFlag')?.value;
            autopayUserAcc.carbonCopyEmailAddress =
              this.accountDetails.controls[index].get(
                'emailNotificationId'
              )?.value;
            autopayUserAcc.targetActionDate = serviceData.scheduledInvoiceDate;
            autopayUserAcc.targetActionDateFrontEnd =
              serviceData.targetActionDateFrontEnd
                ? serviceData.targetActionDateFrontEnd
                : this._convertDateToFrontEnddate(
                    serviceData.scheduledNextInvoiceDate
                  ); // need to chekc this
            autopayUserAcc.postalCodeSAP = serviceData.accountBillingPostcode;
            autopayUserAcc.postalCode = serviceData.accountBillingPostcode;
            autopayUserAcc.obppPreviousAutoPayAccountStatus =
              serviceData.obppPreviousAutoPayAccountStatus;
            enrollAutoPay.autoPayAccountDtoList.push(autopayUserAcc);
          }
        }
        if (isBusinessValid === true) {
          this.enrollAutoPayService
            .setAutoPay(enrollAutoPay)
            .subscribe((data: any) => {
              if (
                data?.serviceResponse?.type == 'success' &&
                data.serviceResponse.object
              ) {
                this.showNextPage = true;
              }
            });
        }
      }
    }
  }
  showNextPageAction() {
    this.showNextPage = false;
  }

  removeAutoPayAccount(cardId: string, accountNumber: string) {
    const modalRef = this.modalService.open(OBPPModalDialogComponent);
    modalRef.componentInstance.my_modal_title = 'REM_ACCT_CONF_TEXT';
    modalRef.componentInstance.my_modal_content =
      'AUTOPAY_ENROLL_REMOVE_ACCOUNT_ALL';
    modalRef.componentInstance.firstButtonLabel = 'REMOVE_ACCT_CONF_TEXT';
    modalRef.componentInstance.secondButtonLabel = 'CANCEL';
    modalRef.componentInstance.modalType = 'warning';

    modalRef.componentInstance.successAction.subscribe(($e: any) => {
      if (cardId) {
        this.enrollAutoPayService
          .fetchAccountDetailsByCardId(cardId)
          .subscribe((accountData: any) => {
            if (
              accountData?.serviceResponse?.type === 'success' &&
              accountData.serviceResponse.object
            ) {
              let requestBody = accountData.serviceResponse.object;
              for (let i = 0; i < requestBody.length; i++) {
                if (accountNumber === '-1') {
                  requestBody[i].userName = '';
                  requestBody[i].targetActionDate = null;
                } else if (requestBody[i].accountNumber === accountNumber) {
                  requestBody[i].userName = '';
                  requestBody[i].targetActionDate = null;
                  requestBody = Array.of(requestBody[i]);
                  break;
                }
              }
              this.enrollAutoPayService
                .removeAutoPayAccounts(
                  requestBody,
                  this.obppAuthService.x_csrf_token
                )
                .subscribe((data: any) => {
                  this.reloadCurrentRoute();
                });
            }
          });
      }
    });
  }
  reloadCurrentRoute() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  getDisplayobppAutoPayAccountStatus(autoPayStatus: string) {
    switch (autoPayStatus) {
      case 'SUSPENDED':
        return 'SUSPENDED_TEXT';
      case 'Suspended':
        return 'SUSPENDED_TEXT';
      case 'ENROLLED':
        return 'ENROLLED_TEXT';
      case 'Enrolled':
        return 'ENROLLED_TEXT';
      case 'NOTENROLLED':
        return 'NOT_ENROLLED_TEXT';
      case 'Not Enrolled':
        return 'NOT_ENROLLED_TEXT';
      case 'NotEnrolled':
        return 'NOT_ENROLLED_TEXT';
      case 'PENDINGACTIVATION':
        return 'PENDING_ACTIVATION_TEXT';
      case 'PendingActivation':
        return 'PENDING_ACTIVATION_TEXT';
      case 'PENDINGACCEPTANCE':
        return 'PENDING_ACCEPTANCE_TEXT';
      case 'PendingAcceptance':
        return 'PENDING_ACCEPTANCE_TEXT';
      case 'pendingacceptance':
        return 'PENDING_ACCEPTANCE_TEXT';
      case 'PENDINGREMOVAL':
        return 'PENDING_REMOVAL_TEXT';
      case 'PendingRemoval':
        return 'PENDING_REMOVAL_TEXT';
      case 'Enrolled By Another User':
        return 'ENROLLEDBY_ANOTHER_USER_TEXT';
      case 'ENROLLEDBYANOTHERUSER':
        return 'ENROLLEDBY_ANOTHER_USER_TEXT';
      case 'Locked for Processing':
        return 'LOCKED_FOR_PROCESSING_TEXT';
      case 'LOCKEDFORPROCESSING':
        return 'LOCKED_FOR_PROCESSING_TEXT';
      default:
        return 'NOT_ENROLLED_TEXT';
    }
  }
}

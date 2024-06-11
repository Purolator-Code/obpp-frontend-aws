import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  AutoPayUserAccount,
  EnrollAutoPay,
} from 'src/app/models/enrollAutopay';
import { EnrollAutopayService } from 'src/app/services/enroll-autopay/enroll-autopay.service';
import { LocalStorageService } from 'src/app/services/global/local-storage.service';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';
import { OBPPModalDialogComponent } from '../../error-component/modal-dialog/modal-dialog.component';

@Component({
  selector: 'obpp-auto-pay',
  templateUrl: './obpp-auto-pay.component.html',
  styleUrls: ['./obpp-auto-pay.component.scss'],
})
export class OBPPUserAutoPayComponent {
  @ViewChild('init__payment') init__payment!: ElementRef;
  paymentSuccessFlag: boolean = false;
  serviceData = new Map();
  creditCardServiceData = new Map();
  showRegisterOption = false;
  creditCardDetails: any;
  autopayList: any;
  creditCardList: any;
  enrollAutoPayForm: FormGroup;
  disableAddAccount = false;
  showNextPage = false;
  errorMap = new Map();
  paymentInformation: any = [];
  declinedMessage: boolean = false;
  cpwaPayload: any;
  paymentInfo: string = ''; // will be deleted
  paymentURL = '';
  frameHeight = 624;
  cpwaQuickPayData: any;
  auotpayEncData: any;
  enrollAutoPaySubmited: any;
  isViewOnly: boolean = false;
  isPostalCheckNeeded: boolean = false;
  allowAddAccount: boolean = false;
  postalCodeChecked: boolean = false;
  enableNext: boolean = false;
  autopayListIndex: number = 0;
  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private enrollAutoPayService: EnrollAutopayService,
    private obppAuthService: OBPPLoginService,
    private router: Router,
    private dataSharingService: DataSharingService,
    private obppLoginService: OBPPLoginService,
    private route: ActivatedRoute,
    public localStorageService: LocalStorageService
  ) {
    this.paymentURL = this.obppLoginService.getCPWAPaymentURL();
    this.isViewOnly = this.obppAuthService.getIsViewOnly();
    let uname = '';
    if (this.isViewOnly) {
      uname = this.obppAuthService.getLookupUserName();
    } else {
      uname = this.obppAuthService.getUserName();
    }
    enrollAutoPayService
      .fetchCurrentCreditCardList(uname, obppAuthService.x_csrf_token)
      .subscribe({
        next: (creditData: any) => {
          if (
            creditData?.serviceResponse?.type === 'success' &&
            creditData.serviceResponse.object
          ) {
            this.creditCardDetails = creditData.serviceResponse.object;
            this.autopayList =
              creditData.serviceResponse.object.autoPayAccountDtoList;
            this.creditCardList =
              creditData.serviceResponse.object.creditCardDtoList;
            this.dataSharingService.enrollForAutoPay.subscribe((enroll) => {
              if (enroll.length === 0) {
                return;
              }
              enroll.forEach((element: string, index: number) => {
                this.addAccount();
                this.accountDetails.controls[index]
                  .get('accountNumber')
                  ?.setValue(element);

                this.accountDetails.controls[index]
                  .get('postalCode')
                  ?.disable();
                this.checkAccountNumber(index);

                const currentDate = new Date();
                const formattedDate = (currentDate.getMonth() + 1).toString().padStart(2, '0') + '-' +
                  currentDate.getDate().toString().padStart(2, '0') + '-' +
                  currentDate.getFullYear();
                this.accountDetails.controls[index]
                  .get('paymentDate')
                  ?.setValue(formattedDate)
              });
              this.enableNext = true;
            });
          }
        },
        error: (error: any) => {
          console.error(error);
        },
      });

    let formArray: any;
    if (enrollAutoPayService.accountNumbers?.length > 0) {
      formArray = [];
    } else {
      formArray = [this.createEmpFormGroup()];
    }
    this.enrollAutoPayForm = this.fb.group({
      accountDetails: this.fb.array(formArray, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(5),
      ]),
    });

    if (enrollAutoPayService.accountNumbers.length > 0) {
      for (let i = 0; i < enrollAutoPayService.accountNumbers.length; i++) {
        this.loadAccountNumberDetailsFromAutopay(
          enrollAutoPayService.accountNumbers[i]
        );
      }
    }

    enrollAutoPayService.accountNumbers = [];
  }

  get accountDetails(): FormArray {
    return this.enrollAutoPayForm.get('accountDetails') as FormArray;
  }

  createEmpFormGroup() {
    return this.fb.group({
      accountNumber: [
        '',
        [
          Validators.minLength(2),
          Validators.maxLength(12),
          Validators.required,
        ],
      ],
      postalCode: [
        '',
        [Validators.required, Validators.minLength(4), Validators.maxLength(11)],
      ],
      accountNumberOriginal: [''],
      isValidPostalCode: true,
      paymentDate: [''],
      autoPayFlag: [false, [Validators.required]],
      emailNotificationId: [
        '',
        [
          Validators.pattern(
            '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,7}$'
          ),
        ],
      ],
      isPreloaded: false,
      isPostalCodeDisabled: true,
      isCheckAccountBalance: false,
      scheduledInvoiceDate:'',
      scheduledNextInvoiceDate:''
    });
  }

  createEmpFormGroupWithValue(
    accNum: string,
    postalCode: string,
    paymentDate: string,
    autoPayFlag: boolean,
    emailNotificationId: string
  ) {
    return this.fb.group({
      accountNumber: [accNum, [Validators.required]],
      accountNumberOriginal: [accNum],
      postalCode: '',
      isValidPostalCode: true,
      paymentDate: [paymentDate],
      autoPayFlag: [autoPayFlag, [Validators.required]],
      emailNotificationId: [
        emailNotificationId,
        [
          Validators.pattern(
            '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,7}$'
          ),
        ],
      ],
      isPreloaded: true,
      isPostalCodeDisabled: true,
      isCheckAccountBalance: false,
      scheduledInvoiceDate:'',
      scheduledNextInvoiceDate:''
    });
  }

  createEmpFormGroupWithLoadeAutopayValue(
    accNum: string,
    paymentDate: string,
    isValidPostalCode: string
  ) {
    return this.fb.group({
      accountNumber: [accNum, [Validators.required]],
      accountNumberOriginal: [accNum],
      postalCode: ['', [Validators.required]],
      isValidPostalCode: true,
      paymentDate: [paymentDate],
      autoPayFlag: [false, [Validators.required]],
      emailNotificationId: [
        '',
        [
          Validators.pattern(
            '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,7}$'
          ),
        ],
      ],
      isPreloaded: true,
      isPostalCodeDisabled: true,
      isCheckAccountBalance: false,
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
      this.errorMap.delete(itemId);
      if (this.accountDetails.controls.length == 0) {
        this.accountDetails.controls.push(this.createEmpFormGroup());
      }
    });
  }

  creditCardLoad(creditCardId: string) {
    if (this.autopayList) {
      this.accountDetails.clear();
      let i = 0;
      this.allowAddAccount = true;
      this.fetchCreditCardDetails(creditCardId);
      for (let autopayaccount of this.autopayList) {
        if (autopayaccount.creditcardid === creditCardId) {
          this.accountDetails.controls.push(
            this.createEmpFormGroupWithValue(
              autopayaccount.accountNumber,
              '',
              autopayaccount.targetActionDateFrontEnd,
              autopayaccount.sendSuccessfullNotificationInd,
              autopayaccount.carbonCopyEmailAddress
            )
          );
          this.accountDetails.updateValueAndValidity({ emitEvent: true });
          this.accountDetails.controls[i].get('accountNumber')?.disable();
          this.accountDetails.controls[i].get('postalCode')?.disable();
          i++;
        }
      }
      this.disableAddAccount = false;
    }
  }

  accountNumberLoad(accountNumber: string) {
    if (this.autopayList) {
      for (let autopayaccount of this.autopayList) {
        const isDuplicate = this.accountDetails.controls.some(control => 
          control.get('accountNumber')?.value === autopayaccount.accountNumber);
        if(this.accountDetails.controls.some(control => 
          control.get('accountNumber')?.value === '')){
            this.accountDetails.clear();
          }
        if (!isDuplicate && autopayaccount.accountNumber === accountNumber) {
          this.accountDetails.controls.push(
            this.createEmpFormGroupWithValue(
              autopayaccount.accountNumber,
              '',
              autopayaccount.targetActionDateFrontEnd,
              autopayaccount.sendSuccessfullNotificationInd,
              autopayaccount.carbonCopyEmailAddress
            )
          );
          this.disableAddAccount = true;
          this.checkAccountNumber(this.autopayListIndex);
          this.accountDetails.controls[this.autopayListIndex].get('accountNumber')?.disable();
          this.accountDetails.controls[this.autopayListIndex].get('postalCode')?.disable();
          this.autopayListIndex++;
        }
      }
      this.accountDetails.updateValueAndValidity({ emitEvent: true });
      this.enableNext = true;
    }
  }

  fetchCreditCardDetails(cardId: string) {
    if (cardId) {
      if (!this.creditCardServiceData.get(cardId)) {
        this.enrollAutoPayService.fetchAccountDetailsByCardId(cardId).subscribe(
          (accountData: any) => {
            if (accountData.serviceResponse.type === 'success'
            ) {
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
    const postalCode = this.accountDetails.controls[index].get('postalCode')?.value;
    if (postalCode) {
      this.checkPostalCode(index)
    }
    
    if (
      isValid === true &&
      this._checkIfAccountNumberExists(accountNumber) === false
    ) {
      this.allowAddAccount = true
      this.errorMap.delete(index);
      this.enrollAutoPayService.fetchAccountId(accountNumber).subscribe(
        (accountData: any) => {
          let object: any = {};
          if (accountData.serviceResponse.type === 'success') {
            this.accountDetails.controls[index]
              .get('isPostalCodeDisabled')
              ?.setValue(false);
            this.accountDetails.controls[index]
              .get('isCheckAccountBalance')
              ?.setValue(true);
            object.accountID = accountData.serviceResponse.object;
            this.enrollAutoPayService
              .fetchAccountStatus(accountNumber)
              .subscribe(
                (accountStatusData: any) => {
                  if (accountStatusData.serviceResponse.type === 'success') {
                    object.obppAutoPayAccountStatus =
                      accountStatusData.serviceResponse.object.obppAutoPayAccountStatus;
                    object.obppAutoPayAccountOwnerID =
                      accountStatusData.serviceResponse.object.obppAutoPayAccountOwnerID;
                    this.serviceData.set(accountNumber, object);
                  }
                }
              );
          }
        }
      );
      return;
    } else if (
      this._checkIfAccountNumberExists(accountNumber) === true &&
      this._checkNoDuplicateAccountsByIndex(index)
    ) {
      this.errorMap.set(index, 'duperror');
    } else if (isValid === true) {
      this.errorMap.delete(index);
    }
  }

  checkPostalCode(index: any) {
    let accountNumber = this.accountDetails.controls[index].get('accountNumber')?.value;
    let postalCode = this.accountDetails.controls[index].get('postalCode')?.value
    // let postalCode = this.accountDetails.controls[index]
    //   .get('postalCode')
    //   ?.value.replace(/\s/g, '')
    //   .toLowerCase();
    // let postalCode_len: number = postalCode ? postalCode.length : 0;
    // if (postalCode_len === 5) {
    //   postalCode = postalCode.toUpperCase();
    // } else if (postalCode_len === 6) {
    //   postalCode = postalCode.match(/.{3}/g).join(' ').toUpperCase();
    // }
    this.dataSharingService.IsLoadingEnabled.next(true);
    this.enrollAutoPayService
      .checkPostalCode(accountNumber, postalCode)
      .subscribe({
        next: (data: any) => {
          this.dataSharingService.IsLoadingEnabled.next(false);
          if (data.serviceResponse.code === 0) {
            this.accountDetails.controls[index]
              .get('isValidPostalCode')
              ?.setValue(true);
            let dateString = data.serviceResponse.object.scheduledInvoiceDate;
            let newString =
              dateString.substr(4, 2) +
              '-' +
              dateString.substr(6, 2) +
              '-' +
              dateString.substr(0, 4);
            this.accountDetails.controls[index]
              .get('paymentDate')
              ?.setValue(newString);
            this.accountDetails.controls[index]
              .get('isCheckAccountBalance')
              ?.setValue(true);
            this.accountDetails.controls[index].get('scheduledInvoiceDate')?.setValue(data.serviceResponse.object.scheduledInvoiceDate)
            this.accountDetails.controls[index].get('scheduledNextInvoiceDate')?.setValue(data.serviceResponse.object.scheduledNextInvoiceDate)
            this.allowAddAccount = true;
            this.postalCodeChecked = true;
            this.enableNext = true
          } else {
            this.allowAddAccount = true;
            this.postalCodeChecked = true;
            this.accountDetails.controls[index]
              .get('isValidPostalCode')
              ?.setValue(false);
            this.accountDetails.controls[index]
              .get('paymentDate')
              ?.setValue('');
            this.accountDetails.controls[index]
              .get('isCheckAccountBalance')
              ?.setValue(false);
          }
        },
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

  loadAccountNumberDetailsFromAutopay(accountNumber: string) {
    if (this._checkIfAccountNumberExists(accountNumber) === false) {
      this.enrollAutoPayService.checkAccountNumber(accountNumber).subscribe(
        (data: any) => {
          if (data.serviceResponse.type === 'success') {
            if (
              data.serviceResponse.object.accountNumber &&
              data.serviceResponse.object.scheduledNextInvoiceDate
            ) {
              let dateString =
                data.serviceResponse.object.scheduledNextInvoiceDate;
              const newString =
                dateString.substr(4, 2) +
                '-' +
                dateString.substr(6, 2) +
                '-' +
                dateString.substr(0, 4);
              this.accountDetails.push(
                this.createEmpFormGroupWithLoadeAutopayValue(
                  accountNumber,
                  newString,
                  data.serviceResponse.object.accountBillingPostcode
                )
              );
              this.enrollAutoPayService.fetchAccountId(accountNumber).subscribe(
                (accountData: any) => {
                  if (accountData.serviceResponse.type === 'success') {
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
                    if (accountData.serviceResponse.type === 'success') {
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
    let currentLen = this.accountDetails.controls.length;
    if (
      this.accountDetails.controls[currentLen - 1].get('accountNumber')
        ?.valid &&
      this._checkNoDuplicateAccounts(currentLen)
    ) {
      this.accountDetails.controls.push(this.createEmpFormGroup());
      this.accountDetails.updateValueAndValidity({ emitEvent: true });
      this.enableNext = true;
    }
    setTimeout(() => {
      const index = this.accountDetails.controls.length - 1;
      const element = document.getElementById(`accountNumber-${index}`);
      if (element) element.focus();
    }, 0);
    
  }

  private _checkNoDuplicateAccounts(currentLen: any) {
    for (let i = 0; i < currentLen; i++) {
      for (let j = 0; j < currentLen && i != j; j++) {
        if (
          this.accountDetails.controls[i].get('accountNumber')?.value ===
          this.accountDetails.controls[j].get('accountNumber')?.value
        ) {
          return false;
        }
      }
    }
    return true;
  }

  _convertDateToFrontEnddate(dateString: string): string {
    if (dateString === null || dateString === undefined || dateString === '')
      return '';
    return dateString.substring(0, 8);
  }

  checkAndRegister(event: MouseEvent) {
    if (this.postalCodeChecked) {
      event.preventDefault();
      this.register();
    }else if (!this.postalCodeChecked){
      this.register();
    }
  }

  register() {
    this.dataSharingService.IsLoadingEnabled.next(true);
    setTimeout(() => {
      this.postalCodeChecked = false;
      if (this.allowAddAccount) {
        let enrollAutoPay = new EnrollAutoPay();
        if (this.obppAuthService.isViewOnly){
          enrollAutoPay.userName = this.obppLoginService.lookupUserName;
        }else {
          enrollAutoPay.userName = this.obppAuthService.userName;
        }
        let isValid = false;
        for (let index = 0; index < this.accountDetails.length; index++) {
          if (!this.accountDetails.controls[index]?.valid) {
            this.dataSharingService.IsLoadingEnabled.next(false);
            return;
          } else if (
            !this.accountDetails.controls[index].get('postalCode')?.disabled
          ) {
            if (
              this.accountDetails.controls[index].get('postalCode')?.value
                .length < 5 ||
              !this.accountDetails.controls[index].get('isValidPostalCode')?.value
            ) {
              this.dataSharingService.IsLoadingEnabled.next(false);
              return;
            } else {
              isValid = true;
            }
          } else {
            isValid = true;
          }
          if (isValid) {
            let autopayUserAcc = new AutoPayUserAccount();
            let serviceData: any = this.serviceData.get(
              this.accountDetails.controls[index].get('accountNumber')?.value
            );
            if (serviceData) {
              autopayUserAcc.accountID = serviceData.accountID;
              autopayUserAcc.creditcardid = serviceData.creditcardid
                ? serviceData.creditcardid
                : '';
              autopayUserAcc.accountNumber = this.accountDetails.controls[index].get('accountNumber')?.value;
              autopayUserAcc.obppAutoPayAccountStatus =
                serviceData.obppAutoPayAccountStatus;
              autopayUserAcc.sendSuccessfullNotificationInd =
                this.accountDetails.controls[index].get('autoPayFlag')?.value;
              autopayUserAcc.carbonCopyEmailAddress =
                this.accountDetails.controls[index].get(
                  'emailNotificationId'
                )?.value;
              autopayUserAcc.targetActionDate =  this.accountDetails.controls[index].get('scheduledInvoiceDate')?.value;
              autopayUserAcc.targetActionDateFrontEnd =
                serviceData.targetActionDateFrontEnd
                  ? serviceData.targetActionDateFrontEnd
                  : this._convertDateToFrontEnddate(
                    this.accountDetails.controls[index].get('scheduledNextInvoiceDate')?.value
                    );
              autopayUserAcc.postalCode = this.accountDetails.controls[index].get('postalCode')?.value;
              autopayUserAcc.obppPreviousAutoPayAccountStatus =
                serviceData.obppPreviousAutoPayAccountStatus;
              enrollAutoPay.autoPayAccountDtoList.push(autopayUserAcc);
            } else {
              this.dataSharingService.IsLoadingEnabled.next(false);
              return;
            }
          }
        }
        this.enrollAutoPayService.setAutoPay(enrollAutoPay).subscribe(
          (data: any) => {
            if (
              data.serviceResponse.type == 'success' &&
              data.serviceResponse.object != null
              ) {
                this.dataSharingService.IsLoadingEnabled.next(true);
              this.enrollAutoPaySubmited = enrollAutoPay;
              this.showNextPage = true;
              this.cpwaPayload = data.serviceResponse.object;
              this.auotpayEncData = enrollAutoPay;
              this.paymentURL = this.obppLoginService.getCPWAPaymentURL();
              setTimeout(() => {
                this.init__payment.nativeElement.submit();
                document.getElementById('labelAutoPay')?.focus();
              }, 200);
              
            }
            this.dataSharingService.IsLoadingEnabled.next(false);
          },
          (error) => {
            this.dataSharingService.IsLoadingEnabled.next(false);
          }
        );
      }
      
    }, 2500);
    setTimeout(() => {
      const element = document.getElementById('goBack');
      if (element) {
          element.focus();
      }
  }, 4500);
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
        this.enrollAutoPayService.fetchAccountDetailsByCardId(cardId).subscribe(
          (accountData: any) => {
            if (
              accountData &&
              accountData.serviceResponse &&
              accountData.serviceResponse.type &&
              accountData.serviceResponse.type === 'success' &&
              accountData.serviceResponse.object
            ) {
              let requestBody = accountData.serviceResponse.object;
              for (let i = 0; i < requestBody.length; i++) {
                if (accountNumber === '-1') {
                  requestBody[i].userName = this.obppAuthService.userName;
                  requestBody[i].targetActionDate = null;
                } else if (requestBody[i].accountNumber === accountNumber) {
                  requestBody[i].userName = this.obppAuthService.userName;
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
          },
          (error: any) => {
            console.error(error);
          }
        );
      }
    });
  }

  reloadCurrentRoute() {
    this.dataSharingService.enrollForAutoPay.next([]);
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  private _checkNoDuplicateAccountsByIndex(i: any) {
    let currentLen = this.accountDetails.controls.length;
    for (let j = 0; j < currentLen && i != j; j++) {
      if (
        this.accountDetails.controls[i].get('accountNumber')?.value ===
        this.accountDetails.controls[j].get('accountNumber')?.value
      ) {
        return true;
      }
    }
    return false;
  }

  returnToManageUsers() {
    this.router.navigateByUrl('/home'), { relativeTo: this.route };
    this.dataSharingService.activeIdString.next('/home');
  }

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent): void {
    if (event.data.event === 'cpwaResize') {
      this.frameHeight = event.data.height;
    }
    let userName:string = this.obppAuthService.userName
    if (event.data.event === 'cpwaCommit') {
      let payload;
      let property: keyof typeof event.data;
      for (property in event.data) {
        if (property === 'payload') {
          payload = event.data[property];
        }
      }
      if (this.obppAuthService.isViewOnly){
        userName = this.obppLoginService.lookupUserName;
      }
      let quickPaySumitpayment = {
        userName: userName,
        unRegisteredUser:
          this.enrollAutoPayForm.get('registerCustomer')?.value &&
          this.showRegisterOption ? 'RegisterEAPUPP' : 'EAPUPP',
        encryptedPaymentResult: payload,
        encryptedPayload: this.cpwaPayload,
        appAndBcRegistrations:
          this.enrollAutoPayForm.get('registerCustomer')?.value &&
          this.showRegisterOption,
        autoPayAccountDtoList: this.enrollAutoPaySubmited.autoPayAccountDtoList,
      };

      this.enrollAutoPayService
        .saveAutoPayAccounts(quickPaySumitpayment)
        .subscribe(
          (paymentres: any) => {
            this.paymentInfo = '';
            this.paymentInformation = [];
            if (paymentres['serviceResponse']['type'] == 'success') {
              this.paymentInformation = paymentres['serviceResponse']['object'];
              this.showNextPage = false;
              this.paymentSuccessFlag = true;
            } else if (
              paymentres['serviceResponse']['type'] == 'error' &&
              paymentres['serviceResponse']['code'] == '8111'
            ) {
              this.declinedMessage = false;
              this.showNextPage = false;
            } else {
              this.declinedMessage = true;
              this.showNextPage = false;
            }
          },
          (err) => {
            this.declinedMessage = true;
            this.showNextPage = false;
          }
        );
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

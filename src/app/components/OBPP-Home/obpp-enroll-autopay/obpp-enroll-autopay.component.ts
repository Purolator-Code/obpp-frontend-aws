import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalDataConfiguration } from 'src/app/data-config/global-data-config';
import { EnrollAutopayService } from 'src/app/services/enroll-autopay/enroll-autopay.service';
import {
  AutoPayUserAccount,
  EnrollAutoPay,
} from 'src/app/models/enrollAutopay';
import { OBPPModalDialogComponent } from '../../error-component/modal-dialog/modal-dialog.component';
import { ModalUserLoginComponent } from 'src/app/common/shared/pop-up-modal/modal-user-login/modal-user-login.component';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';

@Component({
  selector: 'app-obpp-enroll-autopay',
  templateUrl: './obpp-enroll-autopay.component.html',
  styleUrls: ['./obpp-enroll-autopay.component.css'],
})
export class ObppEnrollAutopayComponent implements OnInit {
  @ViewChild('init__payment') init__payment!: ElementRef;
  paymentSuccessFlag: boolean = false;
  serviceData: any = new Map();
  showRegisterOption = false;
  globalDataConfiguration = new GlobalDataConfiguration();
  enrollAutoPayForm: FormGroup;
  phoneNumberMask = [
    /\d/,
    /\d/,
    /\d/,
    '-',
    /\d/,
    /\d/,
    /\d/,
    '-',
    /\d/,
    /\d/,
    /\d/,
    /\d/,
  ];
  isEmailMisMatch = false;
  showNextPage = false;
  errorMap = new Map();
  isLoginModelShown = false;
  paymentInformation: any = [];
  declinedMessage: boolean = false;
  cpwaPayload: any;
  paymentInfo: string = ''; // will be deleted
  paymentURL = '';
  frameHeight = 624;
  cpwaQuickPayData: any;
  auotpayEncData: any;
  enrollAutoPaySubmited: any;
  uname: string = '';
  constructor(
    private dataSharingService: DataSharingService,
    private fb: FormBuilder,
    private router: Router,
    private modalService: NgbModal,
    private enrollAutoPayService: EnrollAutopayService,
    private obppAuthService: OBPPLoginService,
    private obppLoginService: OBPPLoginService,
    private route: ActivatedRoute
  ) {
    this.paymentURL = this.obppLoginService.getCPWAPaymentURL();
    this.enrollAutoPayForm = this.fb.group({
      emailAddress: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,7}$'
          ),
        ],
      ],
      confirmEmailAddress: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,7}$'
          ),
        ],
      ],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      phoneNumberExt: ['', Validators.pattern('^[0-9]{0,6}$')],
      companyName: ['', Validators.required],
      registerCustomer: [true],
      accountDetails: this.fb.array(
        [this.createEmpFormGroup()],
        [Validators.required, Validators.minLength(1), Validators.maxLength(5)]
      ),
    });
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
        [Validators.minLength(4), Validators.maxLength(11), Validators.required],
      ],
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
    });
  }
  get accountDetails(): FormArray {
    return this.enrollAutoPayForm.get('accountDetails') as FormArray;
  }

  checkEmail(event: any) {
    let email = this.enrollAutoPayForm.get('emailAddress')?.value;
    let isEmailValid = this.enrollAutoPayForm.get('emailAddress')?.valid;
    this.checkMatching('check');
    if (isEmailValid === true) {
      this.enrollAutoPayService.checkEmail(email).subscribe({
        next: (data: any) => {
          if (data.serviceResponse.type === 'success') {
            if (
              data.serviceResponse.object === null ||
              data.serviceResponse.object === undefined
            ) {
              this.showRegisterOption = true;
              return;
            } else {
              this.showLoginModel(email);
            }
          }
          this.showRegisterOption = false;
        },
      });
    }
  }

  checkMatching(event: any) {
    let email = this.enrollAutoPayForm.get('emailAddress')?.value;
    let dirtyEmail = this.enrollAutoPayForm.get('emailAddress')?.dirty;
    let cemail = this.enrollAutoPayForm.get('confirmEmailAddress')?.value;
    let dirtyCEmail = this.enrollAutoPayForm.get('confirmEmailAddress')?.dirty;
    if (email && dirtyEmail) {
      if (cemail && dirtyCEmail) {
        if (cemail != email) {
          this.isEmailMisMatch = true;
        } else {
          this.isEmailMisMatch = false;
        }
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
                },
                (error: any) => {
                  console.error(error);
                }
              );
          }
        },
        (error: any) => {
          console.error(error);
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

  _checkIfAccountNumberExists(accountNumber: string): boolean {
    return this.serviceData.get(accountNumber) != (undefined || null);
  }

  checkPostalCode(index: any) {
    let accountNumber =
      this.accountDetails.controls[index].get('accountNumber')?.value;
      let postalCode = this.accountDetails.controls[index]
      .get('postalCode')
      ?.value
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
    this.enrollAutoPayService
      .checkPostalCode(accountNumber, postalCode)
      .subscribe({
        next: (data: any) => {
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
            console.log(this.accountDetails.controls[index]
              .get('paymentDate')
              ?.value);
            
          } else {
            this.accountDetails.controls[index]
              .get('isValidPostalCode')
              ?.setValue(false);
            this.accountDetails.controls[index]
              .get('paymentDate')
              ?.setValue('');
          }
        },
      });
  }

  register() {
    setTimeout(() => {
      let isEnrollPayValid = this.enrollAutoPayForm?.valid;
      let isAccountDetailsValid = this.accountDetails?.valid;
      if (isEnrollPayValid && isAccountDetailsValid) {
        let isBusinessValid = true;
        let enrollAutoPay = new EnrollAutoPay();
        let accountNumbers: string[] = [];
        enrollAutoPay.firstName =
          this.enrollAutoPayForm.get('firstName')?.value;
        enrollAutoPay.lastName = this.enrollAutoPayForm.get('lastName')?.value;
        enrollAutoPay.phoneNumber =
          this.enrollAutoPayForm.get('phoneNumber')?.value;
        enrollAutoPay.phoneNumberExt =
          this.enrollAutoPayForm.get('phoneNumberExt')?.value;
        enrollAutoPay.companyName =
          this.enrollAutoPayForm.get('companyName')?.value;
        enrollAutoPay.emailAddress =
          this.enrollAutoPayForm.get('emailAddress')?.value;
        enrollAutoPay.confirmEmailAddress = this.enrollAutoPayForm.get(
          'confirmEmailAddress'
        )?.value;
        enrollAutoPay.userID = '';
        enrollAutoPay.appAndBcRegistrations =
          this.enrollAutoPayForm.get('registerCustomer')?.value &&
          this.showRegisterOption === true;

        if (enrollAutoPay.confirmEmailAddress != enrollAutoPay.emailAddress) {
          isBusinessValid = false;
        }
        if (isBusinessValid) {
          for (let index = 0; index < this.accountDetails.length; index++) {
            if (this.accountDetails.controls[index]?.valid === false) {
              return;
            } else if (
              !this.accountDetails.controls[index].get('isValidPostalCode')
                ?.value
            ) {
              return;
            } else if (
              accountNumbers.includes(
                this.accountDetails.controls[index].get('accountNumber')?.value
              )
            ) {
              return;
            } else {
              let autopayUserAcc = new AutoPayUserAccount();
              let serviceData: any = this.serviceData.get(
                this.accountDetails.controls[index].get('accountNumber')?.value
              );
              autopayUserAcc.accountID = serviceData.accountID;
              autopayUserAcc.creditcardid = '';
              autopayUserAcc.accountNumber = serviceData.accountNumber;
              autopayUserAcc.obppAutoPayAccountStatus =
                serviceData.obppAutoPayAccountStatus;
              autopayUserAcc.sendSuccessfullNotificationInd =
                this.accountDetails.controls[index].get('autoPayFlag')?.value;
              autopayUserAcc.carbonCopyEmailAddress =
                this.accountDetails.controls[index].get(
                  'emailNotificationId'
                )?.value;
              autopayUserAcc.targetActionDate =
                serviceData.scheduledInvoiceDate;
              autopayUserAcc.targetActionDateFrontEnd =
                this._convertDateToFrontEnddate(
                  serviceData.scheduledNextInvoiceDate
                ); // need to chekc this
              autopayUserAcc.postalCodeSAP = serviceData.accountBillingPostcode;
              autopayUserAcc.postalCode = serviceData.accountBillingPostcode;
              enrollAutoPay?.autoPayUserAccounts?.push(autopayUserAcc);
            }
          }
          if (isBusinessValid === true) {
            this.enrollAutoPayService.enrollAutoPay(enrollAutoPay).subscribe({
              next: (data: any) => {
                this.dataSharingService.IsLoadingEnabled.next(true)
                if (
                  data.serviceResponse.type == 'success' &&
                  data.serviceResponse.object != null
                ) {
                  this.enrollAutoPaySubmited = enrollAutoPay;
                  let auotpayData: EnrollAutoPay = {
                    userId: data.serviceResponse.object,
                    autoPayAccountDtoList: [{ accountNumber: '12345' }],
                  };
                  this.enrollAutoPayService.setAutoPay(auotpayData).subscribe({
                    next: (enData: any) => {
                      this.showNextPage = true;
                      this.cpwaPayload = enData.serviceResponse.object;
                      this.cpwaQuickPayData = enData;
                      this.auotpayEncData = auotpayData;
                      this.paymentURL =
                        this.obppLoginService.getCPWAPaymentURL();
                      this.dataSharingService.IsLoadingEnabled.next(false);
                      setTimeout(() => {
                        this.init__payment.nativeElement.submit();
                      }, 200);
                    },
                  });
                }
              },
            });
          }
        }
      }
    }, 2000);
  }
  markAllDirty(enrollAutoPayForm: FormGroup) {
    Object.keys(enrollAutoPayForm.controls).forEach((key) => {
      if (enrollAutoPayForm.get(key) instanceof FormArray) {
      } else {
        enrollAutoPayForm.get(key)?.markAsDirty();
      }
    });
  }

  markAllArrayDirty(enrollAutoPayForm: FormArray) {
    enrollAutoPayForm.controls.forEach((t) => {
      this.markAllDirty(<FormGroup>t);
    });
  }
  //scheduledNextInvoiceDate
  _convertDateToFrontEnddate(dateString: string): string {
    if (dateString === null || dateString === undefined || dateString === '')
      return '';
    return dateString.substring(0, 8);
  }

  showNextPageAction() {
    this.showNextPage = false;
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
        this.enrollAutoPayForm.removeControl('accountDetails')
        this.enrollAutoPayForm.addControl('accountDetails', this.fb.array([this.createEmpFormGroup()]))
        this.accountDetails.updateValueAndValidity({ emitEvent: true });
      }
    });
  }

  showAlreadyEnrolledModel() {
    const modalRef = this.modalService.open(OBPPModalDialogComponent);
    modalRef.componentInstance.my_modal_title = 'ACCOUNT_EXISTS_TEXT';
    modalRef.componentInstance.my_modal_content = 'OLD_SYSTEM_TXT';
    modalRef.componentInstance.firstButtonLabel = 'EFT_GUIDELINES_CLOSE';
    modalRef.componentInstance.modalType = 'warning';
  }

  showLoginModel(email: any) {
    if (this.isLoginModelShown) {
      return;
    }
    const modalRef = this.modalService.open(ModalUserLoginComponent);
    modalRef.componentInstance.my_modal_title = 'LOGIN_TO_YOUR_ACCOUNT_KEY';
    modalRef.componentInstance.my_modal_content = 'POPUP_LOGIN_TITLE_TEXT';
    modalRef.componentInstance.firstButtonLabel = 'LOGIN_TEXT';
    modalRef.componentInstance.secondButtonLabel =
      'CONTINUE_UNAUTHENTICATED_USER_TEXT';
    modalRef.componentInstance.modalType = 'warning';
    modalRef.componentInstance.username = email;
    this.isLoginModelShown = true;
  }

  addAccount() {
    let currentLen = this.accountDetails.controls.length;
    if (
      this.accountDetails.controls[currentLen - 1].get('accountNumber')
        ?.valid &&
      this._checkNoDuplicateAccounts(currentLen)
    ) {
      const accountDetails = this.enrollAutoPayForm.get('accountDetails') as FormArray
      this.enrollAutoPayForm.removeControl('accountDetails')
      this.enrollAutoPayForm.addControl('accountDetails', this.fb.array([...accountDetails.controls,this.createEmpFormGroup()]))
      accountDetails.updateValueAndValidity({ emitEvent: true });
    }
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
  ngOnInit(): void {
    this.uname = this.obppLoginService.getUserName();
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
      this.returnToManageUsers();
    });
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

    if (event.data.event === 'cpwaCommit') {
      let payload;
      let property: keyof typeof event.data;
      for (property in event.data) {
        if (property === 'payload') {
          payload = event.data[property];
        }
      }

      let quickPaySumitpayment = {
        userId: this.auotpayEncData.userId,
        userName: this.enrollAutoPayForm.get('emailAddress')?.value,
        unRegisteredUser:
          this.enrollAutoPayForm.get('registerCustomer')?.value &&
          this.showRegisterOption
            ? 'RegisterEAPUPP'
            : 'EAPUPP',
        encryptedPaymentResult: payload,
        encryptedPayload: this.cpwaPayload,
        appAndBcRegistrations:
          this.enrollAutoPayForm.get('registerCustomer')?.value &&
          this.showRegisterOption,
        autoPayAccountDtoList: this.enrollAutoPaySubmited.autoPayUserAccounts,
      };

      this.enrollAutoPayService
        .saveAutoPayAccounts(quickPaySumitpayment)
        .subscribe({
          next: (paymentres: any) => {
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
          error: (err) => {
            this.declinedMessage = true;
            this.showNextPage = false;
          },
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

  redirectToHome() {
    if (this.uname) {
      this.dataSharingService.cancelPaymentPlan.next('cancel');
    } else {
      this.router.navigateByUrl('/').then(() => {
        window.location.reload();
      });
    }
  }

  identify(index:any){
    return index
  } 
}

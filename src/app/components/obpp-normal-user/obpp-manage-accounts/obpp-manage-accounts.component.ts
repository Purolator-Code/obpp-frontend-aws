import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EnrollAutopayService } from 'src/app/services/enroll-autopay/enroll-autopay.service';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';
import { ManageAccountsService } from 'src/app/services/manage-accounts/manage-accounts.service';
import { OBPPModalDialogComponent } from '../../error-component/modal-dialog/modal-dialog.component';
import { LocalStorageService } from 'src/app/services/global/local-storage.service';

@Component({
  selector: 'obpp-manage-accounts',
  templateUrl: './obpp-manage-accounts.component.html',
  styleUrls: ['./obpp-manage-accounts.component.scss'],
})
export class OBPPUserManageAccountsComponent {
  accountInformation: any = {};
  currentAccounts: string[] = [];
  manageAccountsForm: FormGroup = new FormGroup({
    addAccountForm: this.fb.group({
      accountNumber: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(12),
        ],
      ],
      postalCode: ['', [Validators.required, Validators.maxLength(11)]],
      accountAccess: ['Full Access', [Validators.required]],
      needToEnroll: [false, [Validators.required]],
      isValidPostalCode: true,
    }),
    additionalNotes: this.fb.control('', [Validators.maxLength(200)]),
    accountDetails: this.fb.array(
      [],
      [Validators.required, Validators.minLength(1), Validators.maxLength(5)]
    ),
  });
  displayAddAccountPage = false;
  disableAddButton = false;
  isChangeSuccessful = false;
  isChangeError = false;
  duplicateAccountNumberError = false;
  optToEnroll = false;
  showCombinationError = false;
  isViewOnly: boolean = false;
  p: number = 1;
  postalCodeChecked: boolean = false;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private manageAccountsService: ManageAccountsService,
    private obppAuthService: OBPPLoginService,
    private router: Router,
    private obbppAutpPayService: EnrollAutopayService,
    public dataSharingService: DataSharingService,
    public localStorageService: LocalStorageService
  ) {
    this.isViewOnly = this.obppAuthService.getIsViewOnly();
    let uname = '';
    if (this.isViewOnly) {
      uname = this.obppAuthService.getLookupUserName();
    } else {
      uname = this.obppAuthService.getUserName();
    }
    manageAccountsService
      .getAccountMasterDetails(uname, obppAuthService.x_csrf_token)
      .subscribe({
        next: (creditData: any) => {
          if (
            creditData?.serviceResponse?.type === 'success' &&
            creditData.serviceResponse.object
          ) {
            this.accountInformation.accounts =
              creditData.serviceResponse.object;
            for (let i = 0; i < creditData.serviceResponse.object.length; i++) {
              let eachElm = creditData.serviceResponse.object[i];
              this.currentAccounts.push(eachElm.accountNumber);
              this.accountDetails.push(
                this.createManageBillingGroup(
                  eachElm.accountNumber,
                  eachElm.status,
                  eachElm.access,
                  eachElm.languagePref,
                  eachElm.paperLessBilling,
                  eachElm.contactName,
                  eachElm.owner,
                  eachElm.obppAutoPayAccountStatus,
                  false,
                  false
                )
              );
            }
          }
        }
      });
  }


  checkOnEnter(accountNumber: any): void {
    this.accountDetails.controls.forEach(account=>{
      if(account.value.accountNumber==accountNumber){
        if(account.value.paperLessBilling==true){
          account.value.paperLessBilling=false;
        }else if (account.value.paperLessBilling==false){
          account.value.paperLessBilling=true;
        }
      }
    })
    
  }

  removeAccessBox(accountNumber: any): void {
    this.accountDetails.controls.forEach(account=>{
      if(account.value.accountNumber==accountNumber){
        if(account.value.removeAccess==true){
          account.value.removeAccess=false;
        }else if (account.value.removeAccess==false){
          account.value.removeAccess=true;
        }
      }
    })
  }
  

  get accountDetails(): FormArray {
    return this.manageAccountsForm.get('accountDetails') as FormArray;
  }

  get addAccountForm(): FormGroup {
    return this.manageAccountsForm.get('addAccountForm') as FormGroup;
  }

  createManageBillingGroup(
    accountNumber: string,
    status: string,
    access: string,
    langPref: string,
    paperLess: boolean,
    contactName: string,
    owner: boolean,
    autopayStatus: string,
    isAddedNewly: boolean,
    enrollForAutoPay: boolean
  ) {
    return this.fb.group({
      accountNumber: [accountNumber],
      status: [status],
      access: [access],
      languagePref: [langPref],
      paperLessBilling: [paperLess],
      contactName: [
        contactName,
        [Validators.required, Validators.maxLength(45)],
      ],
      enrollForAutoPay: [
        {
          value: enrollForAutoPay,
          disabled:
            autopayStatus === 'Enrolled' ||
            (autopayStatus === 'Suspended' && owner == true) ||
            autopayStatus === 'PendingActivation' ||
            autopayStatus === 'Locked for Processing' ||
            autopayStatus === 'PendingAcceptance' ||
            autopayStatus === 'PendingRemoval',
        },
      ],
      obppAutoPayAccountStatus: [autopayStatus],
      isAddedNewly: isAddedNewly,
      removeAccess: false,
    });
  }

  isAccountPending(accNumberIndex: any) {
    return (
      'P' === this.accountInformation.accounts[accNumberIndex].status ||
      'R' === this.accountInformation.accounts[accNumberIndex].status
    );
  }

  addAccount(fromSave: boolean) {
    if (this.displayAddAccountPage) {
      if (this.addAccountForm?.dirty && this.addAccountForm?.valid) {
        if (!this.showCombinationError) {
          this.showCombinationError = false;
          this.accountDetails.push(
            this.createManageBillingGroup(
              this.addAccountForm.get('accountNumber')?.value.trim(),
              'P',
              this.addAccountForm.get('accountAccess')?.value,
              '',
              false,
              '',
              false,
              '',
              true,
              this.addAccountForm.get('needToEnroll')?.value
            )
          );
          this.currentAccounts.push(
            this.addAccountForm.get('accountNumber')?.value.trim()
          );
          this.accountDetails.updateValueAndValidity({ emitEvent: true });
          this.addAccountForm.reset();
          this.addAccountForm.get('needToEnroll')?.setValue(false);
          this.addAccountForm.get('accountAccess')?.setValue('Full Access');
          this.addAccountForm.updateValueAndValidity({ emitEvent: true });
        } else if (fromSave) {
          this.showCombinationError = true;
        }
      }
    }
    this.postalCodeChecked = false;
    this.displayAddAccountPage = true;
    this.duplicateAccountNumberError = false;
  }
  //When requiresServiceCall = true ensure to pass the service data as well..
  remove(requiresServiceCall: boolean, serviceData?: any) {
    const modalRef = this.modalService.open(OBPPModalDialogComponent);
    modalRef.componentInstance.my_modal_title = 'REMOVE_BILLING_CENTER_ACCOUNT';
    modalRef.componentInstance.my_modal_content =
      'REMOVE_BILLING_CENTER_ACCOUNT_TEXT';
    modalRef.componentInstance.firstButtonLabel = 'REMOVE_ACCT_CONF_TEXT';
    modalRef.componentInstance.secondButtonLabel = 'CANCEL';
    modalRef.componentInstance.modalType = 'warning';
    modalRef.componentInstance.successAction.subscribe(($e: any) => {
      this.displayAddAccountPage = false;
      this.disableAddButton = false;
      this.showCombinationError = false;
      if (!requiresServiceCall) {
        this.addAccountForm.reset();
        this.addAccountForm.get('needToEnroll')?.setValue(false);
        this.addAccountForm.get('accountAccess')?.setValue('Full Access');
        this.addAccountForm.updateValueAndValidity({ emitEvent: true });
      } else {
        this.updateAccountDetails(serviceData);
      }
    });
  }

  removeByIndex(index: any) {
    const modalRef = this.modalService.open(OBPPModalDialogComponent);
    modalRef.componentInstance.my_modal_title = 'REMOVE_BILLING_CENTER_ACCOUNT';
    modalRef.componentInstance.my_modal_content =
      'REMOVE_BILLING_CENTER_ACCOUNT_TEXT';
    modalRef.componentInstance.firstButtonLabel = 'REMOVE_ACCT_CONF_TEXT';
    modalRef.componentInstance.secondButtonLabel = 'CANCEL';
    modalRef.componentInstance.modalType = 'warning';
    modalRef.componentInstance.successAction.subscribe(($e: any) => {
      let accountNumber =
        this.accountDetails.controls[index].get('accountNumber')?.value;
      this.currentAccounts.splice(
        this.currentAccounts.indexOf(accountNumber),
        1
      );
      this.accountDetails.controls.splice(index, 1);
    });
  }

  checkAccountNumberAndPostalCode(fromSave?:any) {
    setTimeout(() => {
      const inputElement = document.getElementById('accountNumber');
      if (inputElement) inputElement.focus();
    }, 0);
    if (this.displayAddAccountPage && this.addAccountForm?.dirty) {
      let accountNumber = this.addAccountForm
        .get('accountNumber')
        ?.value.trim();
      let postalCode = this.addAccountForm
        .get('postalCode')
        ?.value
      // let postalCode = this.addAccountForm
      //   .get('postalCode')
      //   ?.value.replace(/\s/g, '')
      //   .toLowerCase();
      // let postalCode_len: number = postalCode ? postalCode.length : 0;
      // if (postalCode_len === 5) {
      //   postalCode = postalCode.toUpperCase();
      // } else if (postalCode_len === 6) {
      //   postalCode = postalCode.match(/.{3}/g).join(' ').toUpperCase();
      // }
      if (this.currentAccounts.indexOf(accountNumber) > 0) {
        this.duplicateAccountNumberError = true;
        return;
      }
      if (postalCode && accountNumber) {
        this.dataSharingService.IsLoadingEnabled.next(true);
        this.manageAccountsService
          .checkAccountNumberPostalCode(accountNumber, postalCode)
          .subscribe({
            next: (data: any) => {
              this.dataSharingService.IsLoadingEnabled.next(false);
              if (data.serviceResponse.type === 'success') {
                
                this.postalCodeChecked = true;
                this.showCombinationError = false;
                this.addAccount(false);
              } else {
                this.postalCodeChecked = false;
                this.showCombinationError = true;
              }
            },
            error: (error: any) => {
              this.dataSharingService.IsLoadingEnabled.next(false);
              this.postalCodeChecked = false;
            },
            complete: ()=>{
             return this.postalCodeChecked
            }
          });
      }
    } else {
      this.displayAddAccountPage = true;
      this.addAccountForm.get('isValidPostalCode')?.setValue(true)
    }
    
  }

  checkAndSave(){
    if(this.postalCodeChecked && this.displayAddAccountPage){
      this.saveAccountDetails()
    } else if (!this.postalCodeChecked && this.displayAddAccountPage){
      if (this.displayAddAccountPage && this.addAccountForm?.dirty) {
        let accountNumber = this.addAccountForm
          .get('accountNumber')
          ?.value.trim();
        let postalCode = this.addAccountForm
          .get('postalCode')
          ?.value.replace(/\s/g, '')
          .toLowerCase();
        let postalCode_len: number = postalCode ? postalCode.length : 0;
        if (postalCode_len === 5) {
          postalCode = postalCode.toUpperCase();
        } else if (postalCode_len === 6) {
          postalCode = postalCode.match(/.{3}/g).join(' ').toUpperCase();
        }
        if (this.currentAccounts.indexOf(accountNumber) > 0) {
          this.duplicateAccountNumberError = true;
          return;
        }
        if (postalCode && accountNumber) {
          this.dataSharingService.IsLoadingEnabled.next(true);
          this.manageAccountsService
            .checkAccountNumberPostalCode(accountNumber, postalCode)
            .subscribe({
              next: (data: any) => {
                this.dataSharingService.IsLoadingEnabled.next(false);
                if (data.serviceResponse.type === 'success') {
                  this.postalCodeChecked = true;
                  this.saveAccountDetails()
                  this.showCombinationError = false;
                } else {
                  this.showCombinationError = true;
                  this.postalCodeChecked = false;
                }
              },
              error: (error: any) => {
                this.dataSharingService.IsLoadingEnabled.next(false);
                this.postalCodeChecked = false;
              },
              complete: ()=>{
               return this.postalCodeChecked
              }
            });
        }
      } else {
        this.displayAddAccountPage = true;
      }
    } else if (!this.displayAddAccountPage){
      this.saveAccountDetails()
    }
  }

  saveAccountDetails() {
      let postingData = [];
      let enrollAutoPayList = [];
      let isRemovevalReq = false;
      let redirectToAutopay = false;
      this.showCombinationError = false;
      if (this.displayAddAccountPage) {
        this.addAccount(true);
        this.displayAddAccountPage = false;
      }

      for (let i = 0; i < this.accountDetails.length; i++) {
        if (
          this.accountDetails.controls[i].get('isAddedNewly')?.value === true
        ) {
          postingData.push(
            this.createNewAccountObject(this.accountDetails.controls[i])
          );
        } else if (this.accountDetails.controls[i]?.dirty == true) {
          let isChanged = false;
          if (
            this.accountDetails.controls[i].get('contactName')?.value !=
            this.accountInformation.accounts[i].contactName
          ) {
            isChanged = true;
          }
          if (
            this.accountDetails.controls[i].get('languagePref')?.value !=
            this.accountInformation.accounts[i].languagePref
          ) {
            isChanged = true;
          }
          if (
            this.accountDetails.controls[i].get('paperLessBilling')?.value !=
            this.accountInformation.accounts[i].paperLessBilling
          ) {
            isChanged = true;
          }
          if (
            this.accountDetails.controls[i].get('removeAccess')?.value == true
          ) {
            isRemovevalReq = true;
            let newData = Object.assign(
              {},
              this.accountInformation.accounts[i]
            );
            newData.action = 'Remove';
            postingData.push(newData);
          } else if (isChanged === true) {
            let newData = Object.assign(
              {},
              this.accountInformation.accounts[i]
            );
            newData.action = 'Update';
            newData.languagePref =
              this.accountDetails.controls[i].get('languagePref')?.value;
            newData.contactName =
              this.accountDetails.controls[i].get('contactName')?.value;
            newData.paperLessBilling =
              this.accountDetails.controls[i].get('paperLessBilling')?.value;
            if (
              this.accountDetails.controls[i].get('enrollForAutoPay')
                ?.disabled == false &&
              this.accountDetails.controls[i].get('enrollForAutoPay')?.value ==
                true
            ) {
              newData.enrollForAutoPay =
                this.accountDetails.controls[i].get('enrollForAutoPay')?.value;
            }
            postingData.push(newData);
          }

          if (
            !this.accountDetails.controls[i].get('enrollForAutoPay')
              ?.disabled &&
            this.accountDetails.controls[i].get('enrollForAutoPay')?.value
          ) {
            redirectToAutopay = true;
            enrollAutoPayList.push(
              this.accountDetails.controls[i].value['accountNumber']
            );
          }
        }
      }
      if (redirectToAutopay) {
        this.dataSharingService.activeIdString.next('/user/autopay');
        this.dataSharingService.enrollForAutoPay.next(enrollAutoPayList);
        this.router.navigateByUrl('/user/autopay');
      }
      if (postingData.length > 0) {
        this.isChangeError = false;
        let accountData = {
          accounts: postingData,
          additionalNotes:
            this.manageAccountsForm.get('additionalNotes')?.value,
          userEmailId: this.obppAuthService.userName,
        };
        if (isRemovevalReq) {
          this.remove(true, accountData);
        } else {
          this.updateAccountDetails(accountData);
        }
      } else {
        this.isChangeError = true;
      }
  }

  createNewAccountObject(formControl: AbstractControl) {
    return {
      accountNumber: formControl.get('accountNumber')?.value,
      languagePref: '',
      paperlessBilling: '',
      contactName: '',
      status: 'P',
      removeRequestedFlag: false,
      editedInCurrentSession: true,
      removeIcon: true,
      obppAutoPayStatus: '',
      action: 'New',
      access: formControl.get('access')?.value,
      isEditable: false,
      number: '',
      postalCode: formControl.get('postalCode')?.value,
      enrollForAutoPay: formControl.get('enrollForAutoPay')?.value,
    };
  }

  updateAccountDetails(accountData: any) {
    this.dataSharingService.IsLoadingEnabled.next(true);
    this.manageAccountsService
      .saveAccountMasterDetails(accountData, this.obppAuthService.x_csrf_token)
      .subscribe(
        (creditData: any) => {
          this.dataSharingService.IsLoadingEnabled.next(false);
          if (creditData.serviceResponse.type == 'error'){
            const modalRef = this.modalService.open(OBPPModalDialogComponent);
            modalRef.componentInstance.my_modal_title =
              'SAVE_ENROL_BILLING_CENTRE_HEADER_TEXT';
            modalRef.componentInstance.my_modal_content = creditData.serviceResponse.message;
            modalRef.componentInstance.firstButtonLabel = 'OK';
            modalRef.componentInstance.modalType = 'warning';
            modalRef.componentInstance.successAction.subscribe(($e: any) => {
              this.returnmanageAccountsClick();
            });
          }
          else {
            let accountNumbers: string[] = [];
            for (let i = 0; i < accountData.accounts.length; i++) {
              if (
                accountData.accounts[i].action == 'Update' ||
                accountData.accounts[i].action == 'New'
              ) {
                if (accountData.accounts[i]?.enrollForAutoPay == true) {
                  accountNumbers.push(accountData.accounts[i].accountNumber);
                }
              }
            }
            if (accountNumbers.length == 0) {
              this.isChangeSuccessful = true;
            } 
            else {
              const modalRef = this.modalService.open(OBPPModalDialogComponent);
              modalRef.componentInstance.my_modal_title =
                'SAVE_ENROL_BILLING_CENTRE_HEADER_TEXT';
              modalRef.componentInstance.my_modal_content =
                'SAVE_ENROL_BILLING_CENTRE_TEXT';
              modalRef.componentInstance.firstButtonLabel = 'OK';
              modalRef.componentInstance.modalType = 'warning';
              modalRef.componentInstance.successAction.subscribe(($e: any) => {
                this.obbppAutpPayService.accountNumbers = accountNumbers;
                this.returntoAutopayClick();
              });
            }
          }
        },
        (error: any) => {
          this.dataSharingService.IsLoadingEnabled.next(false);
        }
      );
  }

  switchButton(event: any) {
    if (event.target.checked == true) {
      this.optToEnroll = true;
    } else {
      if (this.addAccountForm.get('needToEnroll')?.value == true) {
        return;
      }
      for (let i = 0; i < this.accountDetails.length; i++) {
        if (
          this.accountDetails.controls[i].get('enrollForAutoPay')?.disabled ==
            false &&
          this.accountDetails.controls[i].get('enrollForAutoPay')?.value == true
        ) {
          return;
        }
      }
      this.optToEnroll = false;
    }
  }

  returnmanageAccountsClick() {
    let currentUrl = this.router.url;

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.dataSharingService.activeIdString.next('/user/manage-accounts');
      this.router.navigate([currentUrl]);
    });
  }
  returntoAccountSummaryClick() {
    this.dataSharingService.activeIdString.next('/user/account-summary');
    this.router.navigateByUrl('/user/account-summary');
  }
  returntoAutopayClick() {
    this.dataSharingService.activeIdString.next('/user/autopay');
    this.router.navigateByUrl('/user/autopay');
  }

  fieldGlobalIndex(index: number) {
    return 5 * (this.p - 1) + index;
  }
}

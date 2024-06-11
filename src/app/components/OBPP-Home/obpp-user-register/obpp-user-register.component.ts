import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OBPPModalDialogComponent } from '../../error-component/modal-dialog/modal-dialog.component';
import { OBPPUserRegisterService } from 'src/app/services/user-register/user-register.service';
import { GlobalDataConfiguration } from 'src/app/data-config/global-data-config';
import { LocalStorageService } from 'src/app/services/global/local-storage.service';
import { AccountList } from '../../../models/error-inline-message.model';
import { Router } from '@angular/router';
import { OBPPNewuserRegistration } from 'src/app/models/new-user-registration.model';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';

@Component({
  selector: 'obpp-user-register',
  templateUrl: './obpp-user-register.component.html',
  styleUrls: ['./obpp-user-register.component.scss'],
})
export class OBPPUserRegisterComponent implements OnInit {
  @ViewChild('myCheckbox') myCheckbox: ElementRef | undefined;
  content?: string;
  errorInAccountNumber = false;
  termsPDFURL = '';
  addAccountObj: AccountList = {
    type: 'success',
    accNumber: '',
    postalCode: '',
    accessdrp: 'F',
  };
  IsUserregistered = false;
  submitted = false;
  addAccountObjArray: AccountList[] = [];
  globalDataConfiguration = new GlobalDataConfiguration();
  username: string = '';
  pwd: string = '';

  newUserModel = new OBPPNewuserRegistration();

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

  registerForm: FormGroup;

  fieldErrorsObj: any = [];

  constructor(
    private router: Router,
    private obppUserRegService: OBPPUserRegisterService,
    private fb: FormBuilder,
    private obppAuthService: OBPPLoginService,
    private modalService: NgbModal,
    private localStorageService: LocalStorageService,
    private dataSharingService: DataSharingService
  ) {
    this.registerForm = this.fb.group({
      emailAddress: [
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
      languagePref: ['EN'],
      acceptTerms: [false],
    });
  }

  ngOnInit() {
    
  }
checkOnEnter(event: any): void {
  event.preventDefault(); 
  if (this.myCheckbox) {
    this.myCheckbox.nativeElement.checked = !this.myCheckbox.nativeElement.checked;
  }
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

  getLangValue() {
    return this.localStorageService.get('lang');
  }

  validateAccNumber() {
    if (this.addAccountObj.accNumber == '') {
      return false;
    } else if (
      this.addAccountObj.accNumber.length < 2 ||
      this.addAccountObj.accNumber.length > 12
    ) {
      return true;
    }
    return false;
  }

  validatePostalCode() {
    if (this.addAccountObj.postalCode == '') {
      return false;
    } else if (
      this.addAccountObj.postalCode.length < 2
    ) {
      return true;
    }
    return false;
  }

  isAccNumberDuplicated() {
    let uniqueAcc = new Set(
      this.addAccountObjArray.map((item) => item.accNumber)
    );

    if (uniqueAcc.size < this.addAccountObjArray.length) {
      return true;
    } else if (
      this.addAccountObjArray.find(
        (item) => item.accNumber == this.addAccountObj.accNumber
      )
    ) {
      return true;
    }
    return false;
  }

  clearAddAcctObj() {
    this.addAccountObj = {
      type: 'success',
      accNumber: '',
      postalCode: '',
      accessdrp: 'F',
    };
  }

  isEmptyAccountList() {
    return this.addAccountObjArray.length == 0 ? true : false;
  }

  regExCheck(regexpattern: string, val: string) {
    let regex = new RegExp(regexpattern);
    let valid = regex.test(val);
    return valid ? true : false;
  }

  AddIntoAccounts() {
    let accDupli = JSON.parse(JSON.stringify(this.addAccountObjArray));
    this.addAccountObjArray = [];
    accDupli.push(JSON.parse(JSON.stringify(this.addAccountObj)));
    this.addAccountObjArray.push(...accDupli);
    this.clearAddAcctObj();
  }

  IsSubmitDisable() {
    if (
      this.isAccNumberDuplicated() ||
      this.validateAccNumber() ||
      this.validatePostalCode()
    ) {
      return true;
    }
    if (
      this.addAccountObj.accNumber == '' ||
      this.addAccountObj.postalCode == ''
    ) {
      return true;
    }
    return false;
  }

  IsNoErrorInForm() {
    if (
      this.isAccNumberDuplicated() ||
      this.validateAccNumber() ||
      this.validatePostalCode()
    ) {
      return true;
    }
    return false;
  }

  getAccountInformation() {
    if (!this.IsSubmitDisable()) {
      this.errorInAccountNumber = false;
      this.dataSharingService.IsLoadingEnabled.next(true);
      this.obppUserRegService
        .getAccountInfoForUserReg(
          this.addAccountObj.accNumber,
          this.addAccountObj.postalCode
        )
        .subscribe({
          next: (res) => {
            if (res.serviceResponse.type == 'error') {
              this.errorInAccountNumber = true;
            } else if (res.serviceResponse.type == 'success') {
              this.AddIntoAccounts();
            } else {
              this.errorInAccountNumber = true;
            }
            this.dataSharingService.IsLoadingEnabled.next(false);
          },
          error: (error) => {
            this.dataSharingService.IsLoadingEnabled.next(false);
          },
        });
    }
  }

  submitNewUser() {
    this.submitted = true;
    if (
      !this.IsNoErrorInForm() &&
      this.registerForm.valid &&
      this.registerForm.get('acceptTerms')?.value &&
      !this.isEmptyAccountList()
    ) {
      let accAll: any = [];
      let accList: any = [];
      if (this.localStorageService.get('lang') == 'fr') {
        this.addAccountObjArray.forEach((item) => {
          accAll.push({
            accoutNumber: item.accNumber,
            access: this.globalDataConfiguration.accessValuesFr.find(
              (fv: any) => fv.code == item.accessdrp
            ).description,
          });
          accList.push(item.accNumber);
        });
      } else {
        this.addAccountObjArray.forEach((item) => {
          accAll.push({
            accoutNumber: item.accNumber,
            access: this.globalDataConfiguration.accessValuesEn.find(
              (fv: any) => fv.code == item.accessdrp
            ).description,
          });
          accList.push(item.accNumber);
        });
      }

      this.newUserModel.newUserModel = {
        accNumber: '',
        acceptTerms: this.registerForm.get('acceptTerms')?.value,
        accountList: accList,
        accountaccess: '',
        accounts: accAll,
        companyName: this.registerForm.get('companyName')?.value,
        emailAddress: this.registerForm.get('emailAddress')?.value,
        firstName: this.registerForm.get('firstName')?.value,
        language: this.registerForm.get('languagePref')?.value,
        lastName: this.registerForm.get('lastName')?.value,
        phoneNumber: this.registerForm.get('phoneNumber')?.value,
        phoneNumberExt: this.registerForm.get('phoneNumberExt')?.value,
        postalCode: '',
      };
      this.dataSharingService.IsLoadingEnabled.next(true);
      this.obppUserRegService
        .registerNewUser(this.newUserModel.newUserModel)
        .subscribe(
          (res) => {
            let type = res.serviceResponse.type;
            if (type == 'error') {
              this.fieldErrorsObj = [];
              this.fieldErrorsObj.push({
                key: '',
                message: res.serviceResponse.message,
              });
            } else if (type == 'success') {
              this.IsUserregistered = true;
              this.fieldErrorsObj = [];
            } else {
              this.fieldErrorsObj = res.serviceResponse.object.fieldErrors;
            }
            this.dataSharingService.IsLoadingEnabled.next(false);
          },
          (error) => {
            this.dataSharingService.IsLoadingEnabled.next(false);
          }
        );
    }
  }

  redirectToHome() {
    this.router.navigateByUrl('/').then(() => {
      window.location.reload();
    });
  }

  openTerms() {
    this.obppUserRegService.getTermsAndConditionsUrl().subscribe((res) => {
      if (res.serviceResponse.type == 'success') {
        this.termsPDFURL = res.serviceResponse.object;
        window.open(this.termsPDFURL);
      }
    });
   }
  }


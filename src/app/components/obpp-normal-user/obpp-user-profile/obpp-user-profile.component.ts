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
import { ModalChangePasswordComponent } from 'src/app/common/shared/pop-up-modal/modal-change-password/modal-change-password.component';
import { LocalStorageService } from 'src/app/services/global/local-storage.service';
import { UserProfileService } from 'src/app/services/user-profile/user-profile.service';
import { ModalDeleteCreditcardComponent } from 'src/app/common/shared/pop-up-modal/modal-delete-creditcard/modal-delete-creditcard.component';
import { OBPPModalDialogComponent } from '../../error-component/modal-dialog/modal-dialog.component';
import { ModelDeleteEnrolledautopayuserComponent } from 'src/app/common/shared/pop-up-modal/model-delete-enrolledautopayuser/model-delete-enrolledautopayuser.component';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';
@Component({
  selector: 'obpp-user-profile',
  templateUrl: './obpp-user-profile.component.html',
  styleUrls: ['./obpp-user-profile.component.scss'],
})
export class OBPPUserProfileComponent implements OnInit {
  isEditProfile: boolean = true;
  submitted: boolean = false;
  showIFrame: boolean = false;
  showIFrameLoading: boolean = false;
  enableSaveButton : Boolean = false;
  @ViewChild('cpwaForm') cpwaForm!: ElementRef;

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent): void {
    if (event.data.event === 'cpwaCommit') {
      this.getAnnouncement();
      this.getAccountDetails();
      this.getCreditCardDetails();
    }
  }

  userInfo = {
    parentCSRUser: '',
    userEmail: '',
    userRole: '',
    isUserLoggedIn: false,
    firstName: '',
    lastName: '',
    companyName: '',
  };

  userprofile = {
    firstName: '',
    lastName: '',
    emailAddress: '',
    password: '',
    confirmPassword: '',
    newPassword: '',
    currentPassword: '',
    phoneNumber: '',
    language: '',
    phoneNumberExt: '',
    companyName: '',
    errormessage: '',
    userID: '',
    userPreferenceDto: [
      { preferenceName: 'Payment Notification', preferenceValue: false },
      { preferenceName: 'Invoice Notification', preferenceValue: false },
    ],
  };
  userprofileForm: FormGroup;
  user: any;
  roleName = 'customer';
  users = [];
  val: any;
  userEmail: string = '';
  isViewCustScreen: boolean = false;
  isLoading = false;
  isPhoneNumberValid: boolean = false;
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
  autopayCreditCard = {
    autopayList: [],
    creditCardList: [],
  };
  savedCards: Array<{}> = [];
  creditCardDetails: any;
  autopayList: any;
  creditCardList: any;
  payload: any;
  cpwaPayload: any;
  cpwa_frame_url: any;
  paymentEncrypt: any;
  creditDetails: any;

  formEditEnable: any = {
    firstName: false,
    lastName: false,
    phoneNumber: false,
    phoneNumberExt: false,
    companyName: false,
  };

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private router: Router,
    private userProfileService: UserProfileService,
    private route: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private obppLoginService: OBPPLoginService,
    private dataSharingService: DataSharingService
  ) {
    this.userprofileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      phoneNumberExt: ['', Validators.pattern('^[0-9]{0,6}$')],
      companyName: ['', Validators.required],
      // emailAddress: ['', Validators.required],
      // Password: ['', Validators.required],
      language: ['EN'],
      acceptTerms: [false],
    });
  }

  ngOnInit() {
    this.userEmail = this.obppLoginService.getUserName();
    this.getAnnouncement();
    this.getAccountDetails();
    this.getCreditCardDetails();
  }

  
  enableEditField(fieldName: string) {
    this.formEditEnable[fieldName] = true;
    this.enableSaveButton = true;
    setTimeout(() => {
      document.getElementById(fieldName)?.focus();
    });
  }

  getAnnouncement() {
    this.dataSharingService.IsLoadingEnabled.next(true);
    this.userProfileService.getAnnouncement().subscribe({
      next: (res) => {
        if (res) {
          this.dataSharingService.IsLoadingEnabled.next(false);
        }
      },
      error: (error: any) => {
        console.error(error);
        this.dataSharingService.IsLoadingEnabled.next(false);
      },
    });
  }

  getAccountDetails() {
    this.dataSharingService.IsLoadingEnabled.next(true);
    const postdata = this.userEmail;
    this.userProfileService.getAccountDetails(postdata).subscribe({
      next: (res) => {
        if (res.serviceResponse.type === 'success') {
          this.userprofile = res.serviceResponse.object;
          let phoneNumber = this.userprofile.phoneNumber;
          this.userprofile.phoneNumber =
            phoneNumber.slice(0, 3) +
            '-' +
            phoneNumber.slice(3, 6) +
            '-' +
            phoneNumber.slice(6);
        }
        this.dataSharingService.IsLoadingEnabled.next(false);
      },
      error: (error: any) => {
        console.error(error);
        this.dataSharingService.IsLoadingEnabled.next(false);
      },
    });
  }

  getCreditCardDetails() {
    const postdata = this.userEmail;
    this.dataSharingService.IsLoadingEnabled.next(true);
    this.userProfileService.getCreditCardDetails(postdata).subscribe({
      next: (creditData) => {
        if (creditData) {
          this.creditCardDetails = creditData.serviceResponse.object;
          this.autopayList =
            creditData.serviceResponse.object.autoPayAccountDtoList;
          this.creditCardList =
            creditData.serviceResponse.object.creditCardDtoList;
          this.dataSharingService.IsLoadingEnabled.next(false);
        }
      },
      error: (error: any) => {
        this.dataSharingService.IsLoadingEnabled.next(false);
      },
    });
  }

  resetEditFields() {
    this.formEditEnable = {
      firstName: false,
      lastName: false,
      phoneNumber: false,
      phoneNumberExt: false,
      companyName: false,
    };
  }

  triggerEditProfile() {
    this.isEditProfile = true;
  }

  selectInvoiceNotification(event:any){
    this.enableSaveButton=true;
    if (this.userprofile.userPreferenceDto[0].preferenceName === 'Invoice Notification'){
      this.userprofile.userPreferenceDto[0].preferenceValue = event.target.checked
    }else {
      this.userprofile.userPreferenceDto[1].preferenceValue = event.target.checked
    }

  }

  selectPaymentInvoiceNotification(event:any){
    this.enableSaveButton=true;
    if (this.userprofile.userPreferenceDto[1].preferenceName === 'Invoice Notification'){
      this.userprofile.userPreferenceDto[0].preferenceValue = event.target.checked
    }else {
      this.userprofile.userPreferenceDto[1].preferenceValue = event.target.checked
    }
  }

  saveProfile(userprofile: any) {
    this.isPhoneNumberValid=false;
    this.enableSaveButton = false;
    if (userprofile.phoneNumber!=''){
      if(userprofile.phoneNumber.replace('_','').length<12){
      this.isPhoneNumberValid=true;
      }
    } if(!this.isPhoneNumberValid){
    const profile = userprofile;
    this.dataSharingService.IsLoadingEnabled.next(true);
    this.userProfileService.saveUserProfile(profile).subscribe({
      next: (res) => {
        const language = this.userprofileForm.get('language')?.value;
        if (
          profile.userPreferenceDto[0]
            .preferenceName === 'Payment Notification'
        ) {
          this.localStorageService.set(
            window.btoa('sendPaymentNotification'),
            window.btoa(
              profile.userPreferenceDto[0]
                .preferenceValue
            )
          );
        } else if (
          profile.userPreferenceDto[1]
            .preferenceName === 'Payment Notification'
        ) {
          this.localStorageService.set(
            window.btoa('sendPaymentNotification'),
            window.btoa(
              profile.userPreferenceDto[1]
                .preferenceValue
            )
          );
        }
        this.localStorageService.set('lang', language.toLowerCase());
        this.dataSharingService.IsLoadingEnabled.next(false);
        this.resetEditFields();
      },
      error: (error: any) => {
        console.error(error);
        this.dataSharingService.IsLoadingEnabled.next(false);
      },
    });
  }
    return userprofile;
  }

  cancelChanges() {
    this.resetEditFields();
    this.getAccountDetails();
    this.userprofileForm.reset();
    this.isPhoneNumberValid=false;
  }

  gotoAccountSummary() {
    this.router.navigateByUrl('/user/account-summary');
    this.dataSharingService.activeIdString.next("/user/account-summary");
    this.dataSharingService.enrollForAutoPay.next([])
  }

  loadIFrameForNew() {
    let csrid = null;

    if (this.isViewCustScreen) {
      csrid = this.userInfo.parentCSRUser;
    }
    const payment = {
      userId: this.userprofile.userID,
      csrId: csrid,
      totalPayAmount: '0.00',
    };
    this.dataSharingService.IsLoadingEnabled.next(true);

    this.userProfileService.getCPWAFrameURL().subscribe({
      next: (res: any) => {
        if (res.serviceResponse.type == 'success') {
          let cpwaURL = res.serviceResponse.object;
          this.dataSharingService.IsLoadingEnabled.next(false);
          this.cpwa_frame_url = cpwaURL + '/initProfileOBPP';
        }
      },
      error: (error) => {
        console.error(error);
      },
    });

    this.dataSharingService.IsLoadingEnabled.next(true);
    this.userProfileService.addCardDetails(payment).subscribe({
      next: (res) => {
        this.showIFrame = true;
        this.showIFrameLoading = true;
        this.cpwaPayload = res.serviceResponse.object;
        this.dataSharingService.IsLoadingEnabled.next(false);
        setTimeout(() => {
          this.cpwaForm.nativeElement.submit();
        }, 200);
      },
      error: (error: any) => {
        this.dataSharingService.IsLoadingEnabled.next(false);
      },
    });
  }

  showConfirmAccountRemoveModal(
    creditCardId: any,
    ccType: any,
    ccMask: any,
    ccToken: any,
    ccExpiry: any,
    cardHolderName: any,
    obppUserId: any,
    enrolledAutoPay: any
  ) {
    const deleteCreditCard = {
      ccType: ccType,
      creditCardId: creditCardId,
      ccMask: ccMask,
      ccToken: ccToken,
      ccExpiry: ccExpiry,
      cardHolderName: cardHolderName,
      obppUserId: obppUserId,
      enrolledAutoPay: enrolledAutoPay,
    };
    if (enrolledAutoPay == 'Yes') {
      this.modalService.open(ModelDeleteEnrolledautopayuserComponent);
    } else {
      const modalRef = this.modalService.open(ModalDeleteCreditcardComponent);
      modalRef.componentInstance.removeAccount = deleteCreditCard;
      modalRef.componentInstance.successAction.subscribe(
        ($e: any) => {
          this.getCreditCardDetails();
        },
        (error: any) => {
          console.error(error);
        }
      );
    }
  }
  loadIFrameForEdit(
    creditCardId: any,
    ccType: any,
    ccMask: any,
    ccToken: any,
    ccExpiry: any,
    cardHolderName: any
  ) {
    let csrid = null;

    if (this.isViewCustScreen) {
      csrid = this.userInfo.parentCSRUser;
    }

    this.paymentEncrypt = {
      userId: this.userprofile.userID,
      csrId: csrid,
    };

    let editCreditCard = {};
    this.creditDetails = [];
    editCreditCard = {
      ccType: ccType,
      creditCardId: creditCardId,
      ccMask: ccMask,
      ccToken: ccToken,
      ccExpiry: ccExpiry,
      cardHolderName: cardHolderName,
    };
    this.creditDetails.push(editCreditCard);
    this.paymentEncrypt.creditCardDtoList = this.creditDetails;
    this.dataSharingService.IsLoadingEnabled.next(true);
    this.userProfileService.getCPWAFrameURL().subscribe({
      next: (res: any) => {
        if (res.serviceResponse.type == 'success') {
          let cpwaURL = res.serviceResponse.object;
          this.dataSharingService.IsLoadingEnabled.next(false);
          this.cpwa_frame_url = cpwaURL + '/initProfileOBPP';
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
    this.userProfileService.addCardDetails(this.paymentEncrypt).subscribe({
      next: (response) => {
        if (response) {
          this.dataSharingService.IsLoadingEnabled.next(true);
          if (response.serviceResponse.type == 'success') {
            this.showIFrame = true;
            this.cpwaPayload = response.serviceResponse.object;
            this.dataSharingService.IsLoadingEnabled.next(false);
            setTimeout(() => {
              this.cpwaForm.nativeElement.submit();
            }, 200);
          } else {
            this.dataSharingService.IsLoadingEnabled.next(false);
            window.scrollTo(0, 0);
          }
        }
      },
    });
  }

  changePassword() {
    let errMsg = '';
    let tit = 'CHANGE_PASS';
    let desc = 'CHANGE_PASS_INSTRUCTIONS';
    let user_data = this.userprofile;
    this.sendChangePassword(
      tit,
      errMsg,
      desc,
      'OK',
      'CANCEL_TEXT',
      'success',
      user_data
    );
  }

  sendChangePassword(
    title: string,
    errorMsg: string,
    desc: string,
    firstButtonLabel: any,
    secondButtonLabel: any,
    modalType: string,
    user_data: any
  ) {
    const modalRef = this.modalService.open(ModalChangePasswordComponent);
    modalRef.componentInstance.my_modal_title = title;
    modalRef.componentInstance.my_modal_content = errorMsg;
    modalRef.componentInstance.modal_desc = desc;
    modalRef.componentInstance.firstButtonLabel = firstButtonLabel;
    modalRef.componentInstance.secondButtonLabel = secondButtonLabel;
    modalRef.componentInstance.modalType = modalType;
    modalRef.componentInstance.user_data = user_data;
    modalRef.componentInstance.successAction.subscribe(
      ($e: any) => {
        let desc = 'PASSWORD_UPDATED_SUCCESSFULLY';
        let title = 'PASSWORD_CHANGE';
        this.openModal(
          title,
          'PASSWORD_UPDATED_SUCCESSFULLY',
          desc,
          'OK',
          null,
          'warning'
        );
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  openModal(
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
}

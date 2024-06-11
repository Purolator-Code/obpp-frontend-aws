import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalDeleteUserComponent } from 'src/app/common/shared/pop-up-modal/modal-delete-user/modal-delete-user.component';
import { ModalRejectUserComponent } from 'src/app/common/shared/pop-up-modal/modal-reject-user/modal-reject-user.component';
import { ModalSendTempPwdComponent } from 'src/app/common/shared/pop-up-modal/modal-send-temp-pwd/modal-send-temp-pwd.component';
import { ModalTemppwdSuccessComponent } from 'src/app/common/shared/pop-up-modal/modal-temppwd-success/modal-temppwd-success.component';
import { AdminManageUsersService } from 'src/app/services/admin-manage-users/admin-manage-users.service';
import { LocalStorageService } from 'src/app/services/global/local-storage.service';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';
import { OBPPModalDialogComponent } from '../../error-component/modal-dialog/modal-dialog.component';
@Component({
  selector: 'app-obpp-manage-users',
  templateUrl: './obpp-manage-users.component.html',
  styleUrls: ['./obpp-manage-users.component.scss'],
})
export class ObppManageUsersComponent implements OnInit, AfterViewInit {
  @ViewChild('invoiceCheckbox') invoiceCheckbox: ElementRef | undefined;
  @ViewChild('paymentCheckbox') paymentCheckbox: ElementRef | undefined;
  @ViewChild('emailRemit') emailRemit: ElementRef | undefined;
  @ViewChild('paymentNotification') paymentNotification: ElementRef | undefined;
  email: boolean = false;
  accountNumber: boolean = true;
  phoneNumber: boolean = false;
  searchUserForm: FormGroup;
  errMsg: string = '';
  choice: string = 'account';
  addUserForm: FormGroup;
  showCreateUser: boolean = false;
  showCreatedUser: boolean = false;
  showUpdateUser: boolean = false;
  showApproveRejectUser: boolean = false;
  showApprovedUser: boolean = false;
  showInactiveUser: boolean = false;
  showSearchInfo: boolean = false;
  addAccountTrigger: boolean = false;
  showCreateUpdate: boolean = false;
  showEnrollment: boolean = false;
  resendTCButton: boolean = false;
  doesAccountExist: boolean = false;
  pendingAccountAccess: boolean = false;
  flagEAPUAPuser: boolean = false;
  shownManageUsersAccount: boolean = false;
  DisableSaveOnError: boolean = false;
  emailAddress: string = '';
  isPhoneNumberValid: boolean = false;
  emailRegex =
    /^[a-zA-Z0-9_+S-]*(?=[a-zA-Z0-9](?![.]{2}).+)([a-zA-Z0-9_+.S-])*([a-zA-Z0-9-S_+S-]+)\@(([a-zA-Z0-9-S])+\.)+([a-zA-Z0-9S]{2,10})$/;
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
  showErrors: boolean = false;
  showEnteredEmail: boolean = false;
  showSearchedUser: boolean = false;
  showAccounts: boolean = false;
  additionalEMailErrMsg: boolean = false;
  viewRole: string = 'Customer';
  searchUser = {
    emailSearch: '',
    phoneNumberSearch: '',
    accountNumberSearch: '',
  };
  user: any;
  accessdataValues: any;
  accessdataValuesForNotEnrolled!: {
    availableOptions: { id: string; name: string }[];
  };
  autopaystatus_removePendingAct!: {
    availableOptions: { id: string; name: string }[];
  };
  autopaystatus_removePendingAcc!: {
    availableOptions: { id: string; name: string }[];
  };
  autopaystatus_enrol!: { availableOptions: { id: string; name: string }[] };
  autoPaystatus_enrolled!: { availableOptions: { id: string; name: string }[] };
  autoPaystatus_suspended!: {
    availableOptions: { id: string; name: string }[];
  };
  autoPaystatus_remove!: {
    availableOptions: { id: string; name: string }[];
  };
  autoPaystatus_suspend!: {
    availableOptions: { id: string; name: string }[];
  };
  autopaystatusnotenrol!: { availableOptions: { id: string; name: string }[] };
  submitted: boolean = false;
  emailValid: boolean = false;
  userDisplayText: string = '';
  showEnrollAutoPay: boolean = false;
  searchValue: any;
  noUserExist: boolean = false;
  userDetails: any = [];
  approvedUserAddAccount: boolean = false;
  showTempPwdButton: boolean = false;
  roleName: string = '';
  emailCreateForm: boolean = false;
  deletedFlag: boolean = false;
  isAccountStautsPresent: boolean = false;
  register_to_billing_center: boolean = false;
  addAccountError: {
    isAccountNumberInvalid: boolean;
    isAccountNumberPresent: boolean;
  }[] = [];

  // user roles
  ROLE_CSR = 'CSR';
  ROLE_CUSTOMER = 'Customer';
  ROLE_CSR_SUPERVISOR = 'CSR Supervisor';
  ROLE_ADMIN = 'Administrator';
  DIV_ID_MANAGEUSER_MSG = '#manageUsersMsg';

  // rest call handling
  REST_ERROR = 'error';
  REST_SUCCESS = 'success';
  //used in switch case so kept as caps.
  READONLY_HIGHER_ROLE = 'READONLY_HIGHER_ROLE';
  READONLY = 'READONLY';
  setFlagOnForViewCustomer: boolean = false;
  displaySendPasswordErrorMsgList = [];
  accountRestrictions = 100;
  //form field in the html
  APPROVED = 'AP';
  ACCOUNT_NUMBER_FORM = 'accountNumberForm_';
  ACCOUNT_FULL_ACCESS = 'Full Access';
  ACCOUNT_VIEW_ONLY = 'View Only';
  ACCOUNT_NO_ACCESS = 'No Access';
  ACCOUNT_REGEX = new RegExp(/^[a-zA-Z0-9]{2,12}$/);

  // pagination settings
  currentUserDetailsBatch: any = [];
  currentPage: number = 0;
  totalPages: number = 0;
  rowsPerPage: number = 10;
  currentFirstEntry: number = 1;
  currentLastEntry: number = 10;
  p: number = 1;

  loadedAcounts: any;

  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef;
  userRole: any;
  tempPassword: any;
  deleteModalEnrollFlag: boolean = false;
  uname: string = '';
  addDynamicAccount: boolean = true;
  update_emailAddress: any;

  formEditEnable: any = {
    emailAddress: false,
    firstName: false,
    lastName: false,
    phoneNumber: false,
    phoneNumberExt: false,
    companyName: false,
  };

  constructor(
    private fb: FormBuilder,
    private manageUserService: AdminManageUsersService,
    private dataSharingService: DataSharingService,
    private obbpLoginService: OBPPLoginService,
    private localStorageService: LocalStorageService,
    private modalService: NgbModal,
    private router: Router
  ) {
    this.searchUserForm = this.fb.group({
      phoneNumberSearch: [''],
      emailSearch: [''],
      accountNumberSearch: [''],
    });

    this.addUserForm = this.fb.group({
      emailAddress: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,7}$'
          ),
        ],
      ],
      userRole: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      phoneNumberExt: ['', Validators.pattern('^[0-9]{0,6}$')],
      companyName: ['', Validators.required],
      languagePref: ['EN'],
      acceptTerms: [false],
      sendEmailNotification: [''],
      sendAdditionalEmailNotification: [''],
      emailAnotherUser: [''],
      roleDto: [''],
      accounts: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.uname = this.obbpLoginService.getUserName();
    const roleName = this.localStorageService.get(window.btoa('obpprole'));
    this.roleName = window.atob(roleName);
    this.accessdataValues = {
      availableOptions: [
        { id: '1', name: 'FullAccess' },
        { id: '2', name: 'ViewOnly' },
        { id: '3', name: 'NoAccess' },
      ],
    };
    this.accessdataValuesForNotEnrolled = {
      availableOptions: [{ id: '1', name: 'No Access' }],
    };
    this.autopaystatus_removePendingAct = {
      availableOptions: [
        { id: '1', name: 'pendingactivation' },
        { id: '2', name: 'remove' },
      ],
    };
    this.autopaystatus_removePendingAcc = {
      availableOptions: [
        { id: '1', name: 'pendingacceptance' },
        { id: '2', name: 'remove' },
      ],
    };
    this.autopaystatus_enrol = {
      availableOptions: [
        { id: '1', name: 'pendingremoval' },
        { id: '2', name: 'enrolled' },
      ],
    };
    this.autoPaystatus_enrolled = {
      availableOptions: [
        { id: '1', name: 'remove' },
        { id: '2', name: 'suspend' },
        { id: '3', name: 'enrolled' }
      ],
    };
    this.autoPaystatus_suspended = {
      availableOptions: [
        { id: '1', name: 'remove' },
        { id: '2', name: 'enrolled' },
        { id: '3', name: 'suspended' },
      ],
    };
    this.autoPaystatus_remove = {
      availableOptions: [
        { id: '1', name: 'suspend' },
        { id: '2', name: 'enrolled' },
        { id: '3', name: 'remove' },
      ],
    };
    this.autoPaystatus_suspend = {
      availableOptions: [
        { id: '1', name: 'remove' },
        { id: '2', name: 'enrolled' },
        { id: '3', name: 'suspend' },
      ],
    };
    this.autopaystatusnotenrol = {
      availableOptions: [{ id: '1', name: 'notenrolled' }],
    };
  }


  selectInvoice(event: any): void {
    event.preventDefault(); 
    if (this.invoiceCheckbox) {
      
      this.invoiceCheckbox.nativeElement.checked = !this.invoiceCheckbox.nativeElement.checked;
    }
  }

  selectPayment(event: any): void {
    event.preventDefault(); 
    if (this.paymentCheckbox) {
     
      this.paymentCheckbox.nativeElement.checked = !this.paymentCheckbox.nativeElement.checked;
    }
  }

  emailRemitance(event: any): void {
    event.preventDefault(); 
    if (this.emailRemit) {
      
      this.emailRemit.nativeElement.checked = !this.emailRemit.nativeElement.checked;
    }
  }

  paymentInvoiceNotify(event: any): void {
    event.preventDefault(); 
    if (this.paymentNotification) {
     
      this.paymentNotification.nativeElement.checked = !this.paymentNotification.nativeElement.checked;
    }
  }
  ngAfterViewInit(): void {
    this.dataSharingService.cancelPaymentPlan.subscribe((v) => {
      if (v === 'cancel') {
        this.showEnrollAutoPay = !this.showEnrollAutoPay;
      }
    });
  }

  // View Customer Screen
  userSearchTrigger(emailId: string) {
    this.setFlagOnForViewCustomer = true;
    this.dataSharingService.sendEmailId.next(emailId);
    this.obbpLoginService.isViewOnly = true;
    this.obbpLoginService.lookupUserName = emailId;
    this.dataSharingService.activeIdString.next('/csr/viewCustomerScreen');
    this.router.navigateByUrl('/csr/viewCustomerScreen');
  }

  addAccountsToTable() {
    this.userAccounts().clear();
    let acntlength = this.user.accounts.length;
    if (acntlength > 0) {
      for (let count = 0; count <= acntlength - 1; count++) {
        this.addAccountError.push({
          isAccountNumberInvalid: false,
          isAccountNumberPresent: false,
        });
        this.userAccounts().push(
          this.fb.group({
            accoundId: new FormControl(this.user.accounts[count].accoundId),
            accountNumber: new FormControl(
              this.user.accounts[count].accountNumber
            ),
            access: new FormControl(this.user.accounts[count].access),
            status: new FormControl(this.user.accounts[count].status),
            isAccountNumberEditable: new FormControl(true),
            obppAutoPayAccountStatus: new FormControl(
              this.user.accounts[count].obppAutoPayAccountStatus
            ),
          })
        );
        let status = this.userAccounts()
          .at(count)
          .get('obppAutoPayAccountStatus')?.value;
        status.replace('-', '');
        this.userAccounts()
          .at(count)
          .get('obppAutoPayAccountStatus')
          ?.setValue(status.replace(/[\s]/g, '').toLowerCase());
      }
    }
  }

  navigateToUpdateUser(userName: string) {
    this.userDetails.forEach((element: any) => {
      if (element.userName === userName) {
        this.user = element;
      }
    });

    this.showManageUsersMessage(this.DIV_ID_MANAGEUSER_MSG, this.user.status);
    //Role based display for search user
    this.setViewforSearchedUser(this.user);
    this.showSearchedUser = true;
    this.showTempPwdButton = true;
    this.showCreateUpdate = true;
    this.showSearchedUser = true;
    this.setDisplayOnRole();
    this.setFromTypeAndDdata();
    let acntlength = this.user.accounts.length;
    this.addUserForm.removeControl('accounts');
    this.addUserForm.addControl('accounts', this.fb.array([]));
    this.addDynamicAccount = true;
    if (acntlength > 0) {
      for (let count = 0; count <= acntlength - 1; count++) {
        this.addAccountError.push({
          isAccountNumberInvalid: false,
          isAccountNumberPresent: false,
        });
        this.userAccounts().push(
          this.fb.group({
            accoundId: new FormControl(this.user.accounts[count].accoundId),
            accountNumber: new FormControl(
              this.user.accounts[count].accountNumber
            ),
            access: new FormControl(this.user.accounts[count].access),
            status: new FormControl(this.user.accounts[count].status),
            isAccountNumberEditable: new FormControl(true),
            obppAutoPayAccountStatus: new FormControl(
              this.user.accounts[count].obppAutoPayAccountStatus
            ),
          })
        );
        let status = this.userAccounts()
          .at(count)
          .get('obppAutoPayAccountStatus')?.value;
        status.replace('-', '');
        this.userAccounts()
          .at(count)
          .get('obppAutoPayAccountStatus')
          ?.setValue(status.replace(/[\s]/g, '').toLowerCase());
      }
    }
    this.loadedAcounts = this.userAccounts();
  }

  // user status messages
  showManageUsersMessage(divId: any, message: any) {
    this.userDisplayText = message;
  }

  setViewforSearchedUser(user: any) {
    if (user && null !== user) {
      this.viewRole = user.roleDto.roleName;
    }
  }

  //display to be set on the basis of the user searched and user logged in.
  setDisplayOnRole() {
    this.user.loggedInUserName = this.uname;
    if (this.user.roleDto.roleName && this.roleName) {
      let searchUserEmail = this.user.emailAddress.toLowerCase();
      let loggedInUserEmail = this.uname.toLowerCase();
      // user logged in as csr or as csr supervisor
      if (loggedInUserEmail == searchUserEmail) {
        this.user.status = this.READONLY_HIGHER_ROLE;
      }
    }
  }

  // set the error message on the account number
  checkEAPUAPuser(userName: string) {
    let sTempVal = userName;
    sTempVal = !sTempVal ? '' : sTempVal;

    // Regex test and max length test
    if ('' !== sTempVal && sTempVal.trim().length <= 100) {
      let CVV_regex = new RegExp(this.emailRegex);

      if (CVV_regex.test(sTempVal)) {
        this.flagEAPUAPuser = false;
      } else {
        this.flagEAPUAPuser = true;
      }
    }
  }

  checkAutoPayStatus() {
    let length = this.user.accounts.length;

    let checkedPA = 0;

    for (let count = 0; count < length - 1; count++) {
      let status = this.user.accounts[count].obppAutoPayAccountStatus;

      status = status.replace(/-\s/g, '').toLowerCase();

      if (
        this.user.accounts[count].obppAutoPayAccountStatus ==
          'Pending – Acceptance' ||
        this.user.accounts[count].obppAutoPayAccountStatus ==
          'PendingAcceptance' ||
        this.user.accounts[count].obppAutoPayAccountStatus ==
          'PENDINGACCEPTANCE'
      ) {
        checkedPA++;
      }
      if (status == 'pendingacceptance') {
        checkedPA++;
      }
    }

    if (checkedPA > 0) {
      this.resendTCButton = true;
    } else {
      this.resendTCButton = false;
    }
  }

  // show accounts based on the role.
  showRoleBasedAccounts() {
    if (this.user.roleDto.roleName === this.ROLE_CUSTOMER) {
      this.showAccounts = true;
    } else {
      this.showAccounts = false;
    }
  }

  // set the form type depending upon the user status.
  setFromTypeAndDdata() {
    this.showRoleBasedAccounts();
    switch (this.user.status) {
      case 'A': //ACTIVE
        this.showUpdateUser = true;
        this.showCreateUser = false;
        this.showCreatedUser = false;
        this.showApprovedUser = false;
        this.showApproveRejectUser = false;
        this.showInactiveUser = false;
        this.showErrors = false;
        this.approvedUserAddAccount = false;
        //show email notification by default for the active user
        if (this.user?.sendEmailNotification) {
          this.user.sendEmailNotification = true;
        }
        break;
      case 'I': //INACTIVE
        this.showCreatedUser = true;
        this.showInactiveUser = true;
        this.showCreateUser = false;
        this.showApprovedUser = false;
        this.showUpdateUser = false;
        this.showApproveRejectUser = false;
        this.showErrors = false;
        this.approvedUserAddAccount = false;
        break;
      case 'P': //PENDING
        this.showApproveRejectUser = true;
        this.showCreateUser = false;
        this.showCreatedUser = false;
        this.showUpdateUser = false;
        this.showApprovedUser = false;
        this.showInactiveUser = false;
        this.approvedUserAddAccount = false;
        break;
      case 'RP': //ACTIVE
        this.showApproveRejectUser = true;
        this.showCreateUser = false;
        this.showCreatedUser = false;
        this.showUpdateUser = false;
        this.showApprovedUser = false;
        this.showInactiveUser = false;
        this.approvedUserAddAccount = false;
        break;
      case 'AP': //APPROVED
        this.showCreatedUser = false;
        this.showApprovedUser = true;
        this.showCreateUser = false;
        this.showUpdateUser = true;
        this.showApproveRejectUser = false;
        this.showInactiveUser = false;
        this.approvedUserAddAccount = true;
        break;
      case 'READONLY':
        this.showCreatedUser = true;
        this.showApprovedUser = false;
        this.showCreateUser = false;
        this.showUpdateUser = false;
        this.showApproveRejectUser = false;
        this.showInactiveUser = false;
        this.approvedUserAddAccount = false;
        break;
      case 'R': //RESET
        this.showCreatedUser = true;
        this.showApprovedUser = true;
        this.showCreateUser = false;
        this.showUpdateUser = false;
        this.showApproveRejectUser = false;
        this.showInactiveUser = false;
        this.approvedUserAddAccount = false;
        break;
      case 'READONLY_HIGHER_ROLE': //APPROVED
        this.showCreatedUser = true;
        this.showApprovedUser = true;
        this.showCreateUser = false;
        this.showUpdateUser = false;
        this.showApproveRejectUser = false;
        this.showInactiveUser = false;
        break;
    }
  }

  searchUserFormChange(choice: string) {
    this.showCreateUser = false;
    this.showEnrollAutoPay = false;
    this.showSearchInfo = false;
    this.showCreateUpdate = false;
    this.showSearchedUser = false;
    this.register_to_billing_center = false;
    if (choice === 'email') {
      this.email = true;
      this.accountNumber = false;
      this.phoneNumber = false;
    } else if (choice === 'account') {
      this.email = false;
      this.accountNumber = true;
      this.phoneNumber = false;
    } else if (choice === 'phone') {
      this.email = false;
      this.accountNumber = false;
      this.phoneNumber = true;
    }
    this.choice = choice;
    this.searchUserForm.get('emailSearch')?.setValue('');
    this.searchUserForm.get('accountNumberSearch')?.setValue('');
    this.searchUserForm.get('phoneNumberSearch')?.setValue('');
    this.errMsg = '';
  }

  searchRequiredUser() {
    this.showCreateUpdate = false;
    this.showSearchedUser = false;
    this.showEnrollAutoPay = false;
    this.register_to_billing_center = false;
    this.errMsg = '';
    const email = this.searchUserForm.get('emailSearch')?.value;
    const account = this.searchUserForm.get('accountNumberSearch')?.value;
    const phone = this.searchUserForm.get('phoneNumberSearch')?.value;
    if (!email && this.choice === 'email') {
      this.errMsg = 'EMAIL_VALID_TEXT';
    } else if (!phone && this.choice === 'phone') {
      this.errMsg = 'PHONE_REQUIRED';
    } else if (this.choice === 'account' && !account) {
      this.errMsg = 'MANDATORY_ACC_NUMBER';
    } else {
      if (email) {
        this.searchValue = email;
      } else if (phone) {
        this.searchValue = phone;
      } else {
        this.searchValue = account;
      }
    }
    if (email || phone || account) {
      const post_data = {
        searchValue: this.searchValue,
        searchType: this.choice,
      };
      this.dataSharingService.IsLoadingEnabled.next(true);
      this.manageUserService
        .searchUsers(post_data, this.obbpLoginService.getAuthToken())
        .subscribe({
          next: (res) => {
            this.userDetails = res.serviceResponse.object;
            if (this.userDetails.length > 0) {
              this.viewRole = this.userDetails[0].roleDto.roleName;
              this.userRole = this.viewRole;
            }
            this.userDetails.forEach((element: { phoneNumber: string }) => {
              let phoneNumber = element.phoneNumber;
              element.phoneNumber =
                phoneNumber.slice(0, 3) +
                '-' +
                phoneNumber.slice(3, 6) +
                '-' +
                phoneNumber.slice(6);
            });

            this.totalPages = Math.ceil(
              this.userDetails.length / this.rowsPerPage
            );
            this.currentPage = 0;
            this.currentUserDetailsBatch =
              this.totalPages !== 0
                ? this.userDetails.slice(0, this.rowsPerPage)
                : this.userDetails;
            this.currentFirstEntry = 1;
            this.currentLastEntry = 10;

            this.formEditEnable = {
              firstName: false,
              lastName: false,
              phoneNumber: false,
              phoneNumberExt: false,
              companyName: false,
            };

            this.dataSharingService.IsLoadingEnabled.next(false);
          },
          error: (err) => {
            console.error('error', err);
            this.dataSharingService.IsLoadingEnabled.next(false);
          },
        });
      this.showSearchInfo = true;
    }
  }

  nextPage(): void {
    this.currentPage = this.currentPage + 1;
    this.currentFirstEntry = this.currentPage * this.rowsPerPage + 1;
    this.currentLastEntry =
      (this.currentPage + 1) * this.rowsPerPage > this.userDetails.length
        ? this.userDetails.length
        : (this.currentPage + 1) * this.rowsPerPage;
    this.currentUserDetailsBatch = this.userDetails.slice(
      this.currentPage * this.rowsPerPage,
      (this.currentPage + 1) * this.rowsPerPage
    );
  }

  previousPage(): void {
    this.currentPage = this.currentPage - 1;
    this.currentFirstEntry =
      this.currentPage * this.rowsPerPage < 1
        ? 1
        : this.currentPage * this.rowsPerPage + 1;
    this.currentLastEntry = (this.currentPage + 1) * this.rowsPerPage;
    this.currentUserDetailsBatch = this.userDetails.slice(
      this.currentPage * this.rowsPerPage,
      (this.currentPage + 1) * this.rowsPerPage
    );
  }

  jumpToPage(page: number): void {
    this.currentPage = page;
    this.currentFirstEntry =
      this.currentPage * this.rowsPerPage < 1
        ? 1
        : this.currentPage * this.rowsPerPage + 1;
    this.currentLastEntry =
      (this.currentPage + 1) * this.rowsPerPage > this.userDetails.length
        ? this.userDetails.length
        : (this.currentPage + 1) * this.rowsPerPage;
    this.currentUserDetailsBatch = this.userDetails.slice(
      this.currentPage * this.rowsPerPage,
      (this.currentPage + 1) * this.rowsPerPage
    );
  }

  enableEditField(fieldName: string) {
    this.formEditEnable[fieldName] = true;
    setTimeout(() => {
      document.getElementById(fieldName)?.focus();
    });
  }

  registerBillingCenterAccount() {
    this.errMsg = '';
    this.showSearchInfo = false;
    this.showSearchedUser = false;
    this.showCreateUser = true;
    this.showCreatedUser = false;
    this.showUpdateUser = false;
    this.showApprovedUser = false;
    this.showApproveRejectUser = false;
    this.showInactiveUser = false;
    this.addAccountTrigger = true;
    this.showCreateUpdate = true;
    this.showEnrollment = false;
    this.showEnrollAutoPay = false;
    this.register_to_billing_center = true;
    this.viewRole = this.ROLE_CUSTOMER;
    this.userRole = this.ROLE_CUSTOMER;
    this.addAccountError = [];
    this.user = {
      emailAddress:
        this.emailAddress || this.emailAddress === null
          ? ''
          : this.emailAddress,
      firstName: '',
      lastName: '',
      phoneNumber: '',
      phoneNumberExt: '',
      companyName: '',
      roleDto: {
        roleId: 2,
        roleName: this.ROLE_CUSTOMER,
      },
      userPreferenceDto: [
        { preferenceName: 'Payment Notification', preferenceValue: true },
        { preferenceName: 'Invoice Notification', preferenceValue: true },
      ],
      language: 'EN',
      acceptEmailPayments: true,
      accounts: [],
      sendEmailNotification: false,
      sendAdditionalEmailNotification: false,
      emailAnotherUser: '',
      obppAutoPayAccountStatus: 'notenrolled',
    };

    this.showAccounts = true;
    this.addUserForm.removeControl('accounts');
    this.addUserForm.addControl('accounts', this.fb.array([]));
    // Add 5 accounts for the new user
    this.addManageUsersAccount(5);
    this.removeErrorMessages();
  }

  // Wrapper on the clearErrorMessageList
  removeErrorMessages() {
    this.removeValidationMessages();
    this.userDisplayText = '';
    this.showManageUsersMessage(this.DIV_ID_MANAGEUSER_MSG, '');
    this.showErrors = false;
  }

  //remove all the data and the error messages on the form fields
  removeValidationMessages() {
    this.addUserForm.get('emailAddress')?.valid;
    this.addUserForm.get('emailAddress')?.markAsDirty();
    this.addUserForm.get('emailAddress')?.markAsUntouched();
    this.addUserForm.get('emailAddress')?.markAsPristine();

    this.addUserForm.get('firstName')?.valid;
    this.addUserForm.get('firstName')?.markAsDirty();
    this.addUserForm.get('firstName')?.markAsUntouched();
    this.addUserForm.get('firstName')?.markAsPristine();

    this.addUserForm.get('lastName')?.valid;
    this.addUserForm.get('lastName')?.markAsDirty();
    this.addUserForm.get('lastName')?.markAsUntouched();
    this.addUserForm.get('lastName')?.markAsPristine();

    this.addUserForm.get('phoneNumber')?.valid;
    this.addUserForm.get('phoneNumber')?.markAsDirty();
    this.addUserForm.get('phoneNumber')?.markAsUntouched();
    this.addUserForm.get('phoneNumber')?.markAsPristine();

    this.addUserForm.get('phoneNumberExt')?.valid;
    this.addUserForm.get('phoneNumberExt')?.markAsDirty();
    this.addUserForm.get('phoneNumberExt')?.markAsUntouched();
    this.addUserForm.get('phoneNumberExt')?.markAsPristine();

    this.addUserForm.get('companyName')?.valid;
    this.addUserForm.get('companyName')?.markAsDirty();
    this.addUserForm.get('companyName')?.markAsUntouched();
    this.addUserForm.get('companyName')?.markAsPristine();
  }

  // enrolUser() {
  //   this.showEnrollment = true;
  //   this.showSearchInfo = false;
  //   this.submitted = false;
  //   this.showCreateUser = false;
  //   this.addAccountTrigger = false;
  //   this.showCreateUpdate = false;
  //   this.showEnrollAutoPay = true;
  //   this.register_to_billing_center = true;
  // }

  // show the update view for the active user.
  updateView() {
    this.user.status = 'A';
    this.addAccountsToTable();
    this.setFromTypeAndDdata();
    this.viewRole = this.userRole;
  }

  validateEmail(event: any) {
    let sTempVal = event.target.value ? event.target.value : '';

    // Regex test and max length test
    if ('' !== sTempVal && sTempVal.trim().length <= 100) {
      let CVV_regex = this.emailRegex;
      if (CVV_regex.test(sTempVal)) {
        this.additionalEMailErrMsg = false;
      } else {
        this.additionalEMailErrMsg = true;
      }
    } else {
      if (event.target.name == 'emailAnotherUser') {
        this.additionalEMailErrMsg = false;
      } else {
        this.additionalEMailErrMsg = true;
      }
    }
  }

  onCreateUserRoleChange(value: any) {
    this.userRole = value;
    if (this.userRole === 'Customer' && !this.showSearchedUser) {
      this.addUserForm.removeControl('accounts');
      this.addUserForm.addControl('accounts', this.fb.array([]));
      this.addManageUsersAccount(5);
    }
  }

  createUser() {
    if (!this.user.emailAddress) {
      return;
    }
    this.addDynamicAccount = false;
    this.submitted = true;
    if (this.additionalEMailErrMsg) {
      this.emailValid = true;
    } else {
      this.emailValid = false;
    }
    const accounts = this.addUserForm.get('accounts')?.value;
    let userAccounts: any = [];
    accounts.forEach((e: any) => {
      if (e.accountNumber !== '') userAccounts.push(e);
    });
    this.user.accounts = userAccounts;
    this.user.roleDto.roleName = this.userRole;
    delete this.user.sendEmailNotification;
    delete this.user.sendAdditionalEmailNotification;
    delete this.user.emailAnotherUser;

    if (this.validateFromFields() && !this.emailValid) {
      this.removeErrorMessages();
      this.addUserloggedInfo();
      this.manageUserService
        .createAccount(this.user, this.obbpLoginService.getAuthToken())
        .subscribe({
          next: (data) => {
            if (data != null) {
              if (data.serviceResponse.type == this.REST_ERROR) {
                this.errMsg = data.serviceResponse.message;
                window.scroll(0, 0);
              } else if (data.serviceResponse.type == this.REST_SUCCESS) {
                this.register_to_billing_center = false;
                this.user = data.serviceResponse.object;

                this.showManageUsersMessage(
                  this.DIV_ID_MANAGEUSER_MSG,
                  data.serviceResponse.message
                );
                this.setFromTypeAndDdata();
                let acntlength = this.user.accounts.length;
                this.viewRole = this.user.roleDto.roleName;
                this.addUserForm.removeControl('accounts');
                this.addUserForm.addControl('accounts', this.fb.array([]));
                this.addDynamicAccount = true;
                for (let count = 0; count <= acntlength - 1; count++) {
                  this.userAccounts().push(
                    this.fb.group({
                      accoundId: new FormControl(
                        this.user.accounts[count].accoundId
                      ),
                      accountNumber: new FormControl(
                        this.user.accounts[count].accountNumber
                      ),
                      access: new FormControl(this.user.accounts[count].access),
                      status: new FormControl(this.user.accounts[count].status),
                      isAccountNumberEditable: new FormControl(false),
                      obppAutoPayAccountStatus: new FormControl(
                        this.user.accounts[count].obppAutoPayAccountStatus
                      ),
                    })
                  );
                  let status = this.userAccounts()
                    .at(count)
                    .get('obppAutoPayAccountStatus')?.value;
                  status.replace('-', '');
                  this.userAccounts()
                    .at(count)
                    .get('obppAutoPayAccountStatus')
                    ?.setValue(status.replace(/[\s]/g, '').toLowerCase());
                }
              }
            }
          },
          error: (error) => {
            console.error(error);
          },
        });
    } else {
      if (!this.emailValid) {
        this.showErrors = true;
      }
    }
  }

  addUserloggedInfo() {
    if (this.uname) {
      this.user.loggedInUserName = this.uname;
      this.user.loggedInUserRoleName = this.roleName;
    }
  }

  validateFromFields() {
    if (
      this.addUserForm.get('roleDto.roleName')?.value !== this.ROLE_CUSTOMER
    ) {
      return true;
    } else if (
      this.user.roleDto.roleName === this.ROLE_CUSTOMER &&
      this.validateCreateUserFields() &&
      this.validateAccounts()
    ) {
      return true;
    } else if (this.user.accounts.length && this.user.accounts.length > 1) {
      if (
        this.user.roleDto.roleName === this.ROLE_CUSTOMER &&
        this.validateCreateUserFields() &&
        this.validateAccounts() &&
        this.validatePendingAccounts()
      ) {
        return true;
      }
    }
    return false;
  }

  validateCreateUserFields() {
    if (this.addUserForm.get('emailAnotherUser')) {
      if (this.addUserForm.get('emailAnotherUser')?.valid) {
        return (
          this.addUserForm.get('emailAddress')?.valid &&
          this.addUserForm.get('firstName')?.valid &&
          this.addUserForm.get('lastName')?.valid &&
          this.addUserForm.get('phoneNumber')?.valid &&
          this.addUserForm.get('phoneNumberExt')?.valid &&
          this.addUserForm.get('companyName')?.valid &&
          this.addUserForm.get('emailAnotherUser')?.valid
        );
      }
    }

    return (
      this.addUserForm.get('emailAddress')?.valid &&
      this.addUserForm.get('firstName')?.valid &&
      this.addUserForm.get('lastName')?.valid &&
      this.addUserForm.get('phoneNumber')?.valid &&
      this.addUserForm.get('phoneNumberExt')?.valid &&
      this.addUserForm.get('companyName')?.valid
    );
  }

  validateAccounts() {
    let count,
      length = this.user.accounts.length;
    this.doesAccountExist = false;
    // There should be at least one account present

    for (count = length - 1; count >= 0; count--) {
      if (
        this.user.accounts[count]?.accountNumber &&
        !this.ACCOUNT_REGEX.test(this.user.accounts[count].accountNumber)
      ) {
        this.doesAccountExist = false;
      } else if (
        this.user.accounts[count]?.accountNumber &&
        this.ACCOUNT_REGEX.test(this.user.accounts[count].accountNumber)
      ) {
        this.doesAccountExist = true;
        break;
      }
    }
    return this.doesAccountExist;
  }

  validatePendingAccounts() {
    let count: any,
      length: any = this.user.accounts.length;
    this.pendingAccountAccess = false;
    //check the pending accounts
    for (count = length - 1; count >= 0; count--) {
      // Check if the access has been given
      if (
        !this.user.accounts[count].access &&
        this.addUserForm.controls[this.ACCOUNT_NUMBER_FORM + count].invalid
      ) {
        this.pendingAccountAccess = true;
        break;
      }
    }
    return this.pendingAccountAccess;
  }

  sendTermsAndConditions(emailAddres: string) {
    let acntlength = this.user.accounts.length;

    let accountNumber = '';
    for (let j = 0; j < acntlength; j++) {
      if (
        this.user.accounts[j].obppAutoPayAccountStatus ==
          'Pending – Acceptance' ||
        this.user.accounts[j].obppAutoPayAccountStatus == 'PendingAcceptance' ||
        this.user.accounts[j].obppAutoPayAccountStatus == 'PENDINGACCEPTANCE'
      ) {
        accountNumber = this.user.accounts[j].accountNumber;
      }
    }
  }

  userAccounts() {
    return this.addUserForm.get('accounts') as FormArray;
  }

  addUserAccount() {
    return this.fb.group({
      accoundId: new FormControl(''),
      accountNumber: new FormControl(''),
      access: new FormControl(this.ACCOUNT_FULL_ACCESS),
      status: new FormControl(this.APPROVED),
      isAccountNumberEditable: new FormControl(true),
      obppAutoPayAccountStatus: new FormControl(null),
    });
  }

  // Add an account to be associated to the customer user
  addManageUsersAccount(size: number) {
    if (this.addDynamicAccount) {
      for (let i = 0; i < size; i++) {
        this.addAccountError.push({
          isAccountNumberInvalid: false,
          isAccountNumberPresent: false,
        });
        this.userAccounts().push(this.addUserAccount());
      }
    }
  }

  focusOnNew() {
    this.addManageUsersAccount(1);
    let scroll = this.scrollContainer.nativeElement;
    scroll.scrollTop = scroll.scrollHeight;
   
  }

  restrictAccounts() {
    if (this.user.accounts?.length) {
      const nLength = this.user.accounts.length;
      if (nLength >= this.accountRestrictions) {
        this.shownManageUsersAccount = true;
      } else {
        this.shownManageUsersAccount = false;
      }
    }
  }

  cancel() {
    this.showCreateUser = false;
    this.showCreatedUser = false;
    this.showUpdateUser = false;
    this.showApproveRejectUser = false;
    this.showSearchedUser = false;
    this.showEnrollment = false;
    this.showAccounts = false;
    this.errMsg = '';
    this.addUserForm.addControl('accounts', this.fb.array([]));
    if (this.searchUserForm?.get('emailSearch')) {
      this.searchUserForm.get('emailSearch')?.setValue('');
    }
    this.userDisplayText = '';
    this.showErrors = false;
    this.register_to_billing_center = false;
  }

  // Function that will open the confirm modal dialog window for confirmation on save
  showManageUserSaveModal() {
    if (
      this.user.sendAdditionalEmailNotification &&
      !this.user.emailAnotherUser 
      && this.user.phoneNumber.length < 10
    ) {
      this.additionalEMailErrMsg = true;
      this.emailValid = true;
    }else if (this.user.phoneNumber!=''){
      if(this.user.phoneNumber.replace('_','').length<10){
      this.isPhoneNumberValid=true;
      }
    }
    if(!this.isPhoneNumberValid){
      this.emailValid = false;
      this.additionalEMailErrMsg = false;
      const modalRef = this.modalService.open(OBPPModalDialogComponent);
      modalRef.componentInstance.my_modal_title = 'SAVE_USER_TITLE_TEXT';
      modalRef.componentInstance.my_modal_content = 'PROCEED_USER_CONFIRM_TEXT';
      modalRef.componentInstance.modal_desc = '';
      modalRef.componentInstance.firstButtonLabel = 'SAVE_USER_TEXT';
      modalRef.componentInstance.secondButtonLabel = 'CANCEL_TEXT';
      modalRef.componentInstance.modalType = 'warning';
      modalRef.componentInstance.successAction.subscribe(($e: any) => {
        this.triggerUpdate();
      });
    }
  }

  // Function that will check if the account number contains the status
  // if present save the changes if not show the confirmation box
  isAccountNumberStatus() {
    let count = 0,
      lengthModel = this.user.accounts.length;

    for (count; count <= lengthModel - 1; count++) {
      if (
        this.user.accounts[count].access === this.ACCOUNT_FULL_ACCESS ||
        this.user.accounts[count].access === this.ACCOUNT_VIEW_ONLY ||
        this.user.accounts[count].access === this.ACCOUNT_NO_ACCESS
      ) {
        this.isAccountStautsPresent = true;
      } else {
        this.isAccountStautsPresent = false;
        break;
      }
    }

    return this.isAccountStautsPresent;
  }

  // Function that is triggered when the update button is clicked
  triggerUpdate() {
    this.update_emailAddress = this.user.emailAddress;
    this.submitted = true;
    if (
      this.user.emailAnotherUser != '' &&
      this.user.emailAnotherUser != undefined
    ) {
      if (this.additionalEMailErrMsg) {
        this.emailValid = true;
      } else {
        this.emailValid = false;
      }
    }

    if (
      this.validateFromFields() &&
      !this.DisableSaveOnError &&
      !this.emailValid && !this.isPhoneNumberValid
    ) {
      this.removeErrorMessages();
      this.addUserloggedInfo();
      const accounts = this.addUserForm.get('accounts')?.value;
      accounts.forEach((element: any) => {
        if (!element.obppAutoPayAccountStatus) {
          delete element.obppAutoPayAccountStatus;
          this.user.accounts.push(element);
        }
        let mappedAccount = this.user.accounts.find((a:any) => a.accoundId === element.accoundId);
        if (mappedAccount) {
          mappedAccount.access = element.access;
          if (mappedAccount.status !== element.status) {
            mappedAccount.obppAutoPayAccountStatus = String(element.status).toUpperCase();
          }
        }
      });
      this.user.roleDto.roleName = this.userRole;
      this.user.sendEmailNotification = this.addUserForm.get('sendEmailNotification')?.value
      this.dataSharingService.IsLoadingEnabled.next(true);
      this.manageUserService
        .updateUserProfile(this.user, this.obbpLoginService.getAuthToken())
        .subscribe({
          next: (data) => {
            if (data.serviceResponse.type == this.REST_ERROR) {
              this.dataSharingService.IsLoadingEnabled.next(false);
              this.DisableSaveOnError = false;
              this.errMsg = data.serviceResponse.message;
              window.scroll(0, 0);
              const acntlength = this.user.accounts.length;
              const filteredAccounts = this.user.accounts.filter(
                (e: any) => !!e.accoundId
              );
              this.user.accounts = filteredAccounts;
              this.userAccounts().clear();
              for (let count = 0; count <= acntlength - 1; count++) {
                this.userAccounts().push(
                  this.fb.group({
                    accoundId: new FormControl(
                      filteredAccounts[count].accoundId
                    ),
                    accountNumber: new FormControl(
                      filteredAccounts[count].accountNumber
                    ),
                    access: new FormControl(filteredAccounts[count].access),
                    status: new FormControl(filteredAccounts[count].status),
                    isAccountNumberEditable: new FormControl(false),
                    obppAutoPayAccountStatus: new FormControl(
                      filteredAccounts[count].obppAutoPayAccountStatus
                    ),
                  })
                );
                let status = this.userAccounts()
                  .at(count)
                  .get('obppAutoPayAccountStatus')?.value;
                status.replace('-', '');
                this.userAccounts()
                  .at(count)
                  .get('obppAutoPayAccountStatus')
                  ?.setValue(status.replace(/[\s]/g, '').toLowerCase());
              }
            } else if (data.serviceResponse.type == this.REST_SUCCESS) {
              this.dataSharingService.IsLoadingEnabled.next(false);
              this.errMsg = '';
              this.user = data.serviceResponse.object;
              this.showManageUsersMessage(
                this.DIV_ID_MANAGEUSER_MSG,
                data.serviceResponse.message
              );
              this.user.status = this.READONLY;
              let acntlength = this.user.accounts.length;
              this.setFromTypeAndDdata();
              this.addAccountsToTable();
              for (let count = 0; count <= acntlength - 1; count++) {
                let status = this.user.accounts[count].obppAutoPayAccountStatus;
                status.replace('-', '');
                this.user.accounts[count].obppAutoPayAccountStatus = status
                  .replace(/[\s]/g, '')
                  .toLowerCase();
              }
            }
          },
          error: (error) => {
            this.dataSharingService.IsLoadingEnabled.next(false);
          },
        });
    } else {
      if (!this.emailValid) {
        this.showErrors = true;
      }
    }
  }

  showConfirmDeleteModal() {
    if (this.checkAutoPayStatusFlag()) {
      this.openModal(
        '',
        'DELETE_MANAGE_USERS_TEXT',
        '',
        'EFT_GUIDELINES_CLOSE',
        null,
        'warning'
      );
    } else {
      let user_data = this.user;
      // Reset to initial state
      this.submitted = true;
      this.removeErrorMessages();
      this.addUserloggedInfo();
      this.deleteUser(user_data, 'warning');
    }
  }

  checkAutoPayStatusFlag() {
    let count = 0,
      length = this.user.accounts.length;
    let checkedLength = 0;

    for (count; count < length - 1; count++) {
      if (
        this.user.accounts[count].obppAutoPayAccountStatus != 'Not Enrolled' &&
        this.user.accounts[count].obppAutoPayAccountStatus !=
          'Enrolled By Another User' &&
        this.user.accounts[count].obppAutoPayAccountStatus !=
          'enrolledbyanotheruser' &&
        this.user.accounts[count].obppAutoPayAccountStatus != 'notenrolled'
      ) {
        checkedLength++;
      }
    }
    if (checkedLength > 0) {
      this.deleteModalEnrollFlag = true;
    } else if (checkedLength == 0) {
      this.deleteModalEnrollFlag = false;
    }
    return this.deleteModalEnrollFlag;
  }

  deleteUser(user_data: any, modalType: string) {
    const modalRef = this.modalService.open(ModalDeleteUserComponent);
    modalRef.componentInstance.modalType = modalType;
    modalRef.componentInstance.user_data = user_data;
    modalRef.componentInstance.successAction.subscribe(($e: any) => {
      this.showCreateUpdate = false;
      this.showSearchInfo = false;
    });
  }

  saveApprove() {
    this.manageUserService
      .approveUserProfile(this.user, this.obbpLoginService.getAuthToken())
      .subscribe({
        next: (data) => {
          if (data != null) {
            if (data.serviceResponse.type == this.REST_ERROR) {
              this.user = data.serviceResponse.object;
            } else if (data.serviceResponse.type == this.REST_SUCCESS) {
              this.user = data.serviceResponse.object;
              this.showManageUsersMessage(
                this.DIV_ID_MANAGEUSER_MSG,
                data.serviceResponse.message
              );
              this.setFromTypeAndDdata();
              let acntlength = this.user.accounts.length;
              for (let count = 0; count <= acntlength - 1; count++) {
                let status = this.user.accounts[count].obppAutoPayAccountStatus;
                status.replace('-', '');
                this.user.accounts[count].obppAutoPayAccountStatus = status
                  .replace(/[\s]/g, '')
                  .toLowerCase();
              }
            }
          }
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  showConfirmRejectModal() {
    let user_data = this.user;
    // Reset to initial state
    this.submitted = true;
    this.removeErrorMessages();
    this.addUserloggedInfo();
    this.rejectUser(user_data, 'warning');
  }

  rejectUser(user_data: any, modalType: string) {
    const modalRef = this.modalService.open(ModalRejectUserComponent);
    modalRef.componentInstance.modalType = modalType;
    modalRef.componentInstance.user_data = user_data;
    modalRef.componentInstance.successAction.subscribe(($e: any) => {
      this.showCreateUpdate = false;
      this.showSearchInfo = false;
    });
  }

  reinstateUser() {
    this.removeErrorMessages();
    this.addUserloggedInfo();
    this.manageUserService
      .reinstateUserProfile(this.user, this.obbpLoginService.getAuthToken())
      .subscribe({
        next: (data) => {
          if (data != null) {
            if (data.serviceResponse.type == this.REST_SUCCESS) {
              this.user = data.serviceResponse.object;
              this.showManageUsersMessage(
                this.DIV_ID_MANAGEUSER_MSG,
                data.serviceResponse.message
              );
              let acntlength = this.user.accounts.length;
              this.setFromTypeAndDdata();
              for (let count = 0; count <= acntlength - 1; count++) {
                let status = this.user.accounts[count].obppAutoPayAccountStatus;
                status.replace('-', '');
                this.user.accounts[count].obppAutoPayAccountStatus = status
                  .replace(/[\s]/g, '')
                  .toLowerCase();
              }
              return;
            }
          }
        }
      });
  }

  sendTempPassword() {
    this.showEnrollment = false;
    let searchedUser = this.searchUserForm.get('emailSearch')?.value;
    if (
      searchedUser == null ||
      searchedUser == '' ||
      searchedUser == undefined
    ) {
      searchedUser = this.user.userName;
    }
    // Reset to initial state
    this.submitted = true;
    this.removeErrorMessages();
    const modalRef = this.modalService.open(ModalSendTempPwdComponent);
    modalRef.componentInstance.modalType = 'warning';
    modalRef.componentInstance.user_data = searchedUser;
    modalRef.componentInstance.successAction.subscribe((data: any) => {
      this.tempPassword = data.serviceResponse.object;
      if (this.tempPassword) {
        const modalRef = this.modalService.open(ModalTemppwdSuccessComponent);
        modalRef.componentInstance.modalType = 'warning';
        modalRef.componentInstance.user_data = this.tempPassword;
        modalRef.componentInstance.successAction.subscribe((data: any) => {
          this.showCreateUpdate = false;
          this.showSearchInfo = false;
        });
      }
    });
  }

  showAccountNumberField(formIndex: any) {
    if (this.showCreateUser) {
      return true;
    } else if (this.showCreatedUser) {
      return false;
    } else if (
      (this.showUpdateUser &&
        this.userAccounts().at(formIndex) &&
        this.userAccounts().at(formIndex).get('isAccountNumberEditable')
          ?.value) ||
      (this.showApproveRejectUser &&
        this.userAccounts().at(formIndex) &&
        this.userAccounts().at(formIndex).get('isAccountNumberEditable')?.value)
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkAccountNumber(formIndex: any, account: any) {
    // If the data is blank, valid accountNumber
    let tempModel = account.value['accountNumber'];
    const tempModelCopy = account.value['accountNumber'];
    const accountNumberControl = this.userAccounts()
      .at(formIndex)
      .get('accountNumber');
    const accountNumberError = this.addAccountError[formIndex];
    if (tempModel.length > 1) {
      accountNumberControl?.setValue(tempModel);
    } else {
      accountNumberControl?.invalid;
    }

    if (accountNumberControl?.dirty) {
      if (accountNumberControl?.value === '') {
        accountNumberError.isAccountNumberInvalid = false;
        accountNumberError.isAccountNumberPresent = false;
        this.DisableSaveOnError = false;
      } else if (accountNumberControl?.invalid) {
        //if length is less or pattern does not match
        accountNumberControl?.invalid;
        accountNumberError.isAccountNumberPresent = false;
        this.DisableSaveOnError = true;
      } else if (accountNumberControl?.valid) {
        if (!this.ACCOUNT_REGEX.test(accountNumberControl?.value)) {
          accountNumberError.isAccountNumberInvalid = true;
          accountNumberError.isAccountNumberPresent = false;
          this.DisableSaveOnError = true;
          return;
        }
        //the account is valid check if it is already present;
        accountNumberError.isAccountNumberInvalid = false;
        this.DisableSaveOnError = false;

        length = this.userAccounts().value.length;
        for (let count = 0; count < length - 1; count++) {
          if (count === formIndex) {
            continue;
          } else if (
            accountNumberControl?.value &&
            accountNumberControl?.value !== '' &&
            accountNumberControl?.value ===
              this.userAccounts().at(count).get('accountNumber')?.value
          ) {
            accountNumberError.isAccountNumberPresent = true;
            this.DisableSaveOnError = true;
            break;
          } else {
            accountNumberError.isAccountNumberPresent = false;
            this.DisableSaveOnError = false;
            continue;
          }
        }

        let acntlength = this.userAccounts().value.length;

        for (let j = 0; j < acntlength; j++) {
          if (
            tempModelCopy ===
            this.userAccounts().at(j).get('accountNumber')?.value
          ) {
            if (this.userAccounts().get('accountNumber')?.value.length == 12) {
              this.userAccounts()
                .at(j)
                .get('accountNumber')
                ?.setValue(Number(tempModel));
            }
          }
        }
      }
    }
  }

  selectInvoiceNotification(event:any){
    if (this.user.userPreferenceDto[0].preferenceName === 'Invoice Notification'){
      this.user.userPreferenceDto[0].preferenceValue = event.target.checked
    }else {
      this.user.userPreferenceDto[1].preferenceValue = event.target.checked
    }

  }

  selectPaymentInvoiceNotification(event:any){
    if (this.user.userPreferenceDto[1].preferenceName === 'Invoice Notification'){
      this.user.userPreferenceDto[0].preferenceValue = event.target.checked
    }else {
      this.user.userPreferenceDto[1].preferenceValue = event.target.checked
    }
  }

  checkSendEmailNotification(event:any){
    this.addUserForm.get('sendEmailNotification')?.setValue(event.targe.value)
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

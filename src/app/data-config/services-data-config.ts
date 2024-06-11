import { environment } from 'src/environments/environment';

export class ServicesDataConfiguration {
  private _apiBaseURL: string = environment.apiURL;
  private _authURL: string =
    '/billingcentre/obpp/service/app/home/login/LANG_AUTH/';
  private _logoutURL: string =
    '/billingcentre/obpp/service/app/home/clearCache?username={USER_NAME}';
  private _liveChatURL: string =
    '/billingcentre/obpp/service/app/home/getLiveChatNewUrl/LANG_AUTH/';
  private _accSummary =
    '/billingcentre/obpp/service/app/getAPPAccountInfo/LANG_AUTH/';
  private _accountInfoQuickPay =
    '/billingcentre/obpp/service/app/quickpayCPWA/{ACCOUNT_NUMBER}/invoices/{INVOICE_NUMBER}/postalCode/{POSTAL_CODE}/LANG_AUTH';
  private _forgotPassword =
    '/billingcentre/obpp/service/app/home/sendpassword/LANG_AUTH/';
  private _announcements =
    '/billingcentre/obpp/service/app/home/getAnnouncement/LANG_AUTH/';
  private _accInfo =
    '/billingcentre/obpp/service/app/getAPPAccountInfo/LANG_AUTH/?accountNumber={ACCOUNT_NUMBER}';
  private _terms4UserReg =
    '/billingcentre/obpp/service/app/registration/pdfUrl/LANG_AUTH';
  private _newuserRegisteration =
    '/billingcentre/obpp/service/app/registration/registerUser/LANG_AUTH';
  private _checkEmail: string =
    '/billingcentre/obpp/service/app/getAPPUserStatus/LANG_AUTH/';
  private _accountNumberInfo: string =
    '/billingcentre/obpp/service/app/getAPPAccountInfo/LANG_AUTH/';
  private _accountIdInfo: string =
    '/billingcentre/obpp/service/app/APPgetAccountId/LANG_AUTH/';
  private _autoPayAccountInfo: string =
    '/billingcentre/obpp/service/app/APPgetAutoPayAccount/LANG_AUTH/';
  private _registerAutoPay: string =
    '/billingcentre/obpp/service/app/registerAPPUser/LANG_AUTH/';
  private _creditCardList: string =
    '/billingcentre/obpp/service/app/APPgetCreditCards/LANG_AUTH/';
  private _setAutoPay: string =
    '/billingcentre/obpp/service/app/APPEncrypt/LANG_AUTH/';
  private _creditCardInfo: string =
    '/billingcentre/obpp/service/app/APPgetAccountsByCardId/LANG_AUTH/';
  private _removeAutoPayAccounts: string =
    '/billingcentre/obpp/service/app/APPremoveAccounts/LANG_AUTH/';
  private _saveAutoPayAccounts: string =
    '/billingcentre/obpp/service/app/APPSaveAccounts/LANG_AUTH/';
  private _quickpay_security_audit: string =
    '/billingcentre/obpp/service/app/saveAPPAccountSecurityAudit/en';
  private _accept_terms_from_email: string = 
    '/billingcentre/obpp/service/app/acceptTermsFromEmail/LANG_AUTH';
  private _userProfile: string =
    '/billingcentre/obpp/service/app/home/getUserProfile/LANG_AUTH';
  private _creditCardDetails: string =
    '/billingcentre/obpp/service/app/home/getUserProfileCreditDetails/LANG_AUTH';
  private _addCardView: string =
    '/billingcentre/obpp/service/app/APPEncrypt/LANG_AUTH';
  private _saveUserProfile: string =
    '/billingcentre/obpp/service/app/home/saveUserProfile/LANG_AUTH';
  private _changePassowrd: string =
    '/billingcentre/obpp/service/app/home/changePassword/LANG_AUTH';
  private _removeCreditCard: string =
    '/billingcentre/obpp/service/app/home/APPremoveCreditCard/LANG_AUTH';
  private _getCPWAFrameURL: string = "/billingcentre/obpp/service/app/home/getCPWAURL/LANG_AUTH/"

  private _retrieveAccountMaster: string = "/billingcentre/obpp/service/app/user/retrieveAccountMaster/LANG_AUTH/";
  private _submitAccountChanges: string = "/billingcentre/obpp/service/app/user/submitAccountChange/LANG_AUTH/";

  private _cpwa_payment_encrypt: string = "/billingcentre/obpp/service/app/quickpayCPWA/paymentencrypt/LANG_AUTH/";
  private _cpwa_URL: string = "/billingcentre/obpp/service/app/home/getCPWAURL/LANG_AUTH/";

  private _accountSummaryUser: string = "/billingcentre/obpp/service/app/account/accounts/LANG_AUTH?username={USER_NAME}";
  private _invoicePDF: string = "/billingcentre/obpp/service/app/account/getInvoicePdf/LANG_AUTH?invoicenumber={INVOICE_NUMBER}";
  private _cpwa_payment_decrypt: string = "/billingcentre/obpp/service/app/quickpayCPWA/paymentdecrypt/LANG_AUTH/";
  private _closedAccountSummary: string = "/billingcentre/obpp/service/app/account/accountsWithClosedInvoices/LANG_AUTH?username={USER_NAME}";

  private _searchUsers: string = "/billingcentre/obpp/service/app/manageusers/findUserProfiles/LANG_AUTH"
  private _cpwa_acct_summary_encrypt: string = "/billingcentre/obpp/service/app/account/submitPayment/LANG_AUTH/";
  private _cpwa_acct_summary_decrypt: string = "/billingcentre/obpp/service/app/account/submitPaymentDecrypt/LANG_AUTH/";
  private _shipmentTrackerURL: string = "/billingcentre/obpp/service/app/account/shipmentPinUrl";
  private _dispute_InvoiceURL: string = "/billingcentre/obpp/service/app/account/dispute/LANG_AUTH/";
  private _searchByAccountOrInvoice: string = "/billingcentre/obpp/service/app/csr/searchByAccountOrInvoice/LANG_AUTH/";
  private _searchByAccountNameOrAddress: string = "/billingcentre/obpp/service/app/csr/searchByAccountNameOrAddress/LANG_AUTH/";
  private _searchByBillOfLading: string = "/billingcentre/obpp/service/app/csr/searchByBillOfLading/LANG_AUTH/";
  private _accountSummaryFromAccountNumbers: string = "/billingcentre/obpp/service/app/csr/getAccountSummaryFromAccountNumbers/LANG_AUTH/";

  //manage users
  private _createAccount: string = "/billingcentre/obpp/service/app/manageusers/createUserProfile/LANG_AUTH";
  private _updateUserProfile: string = "/billingcentre/obpp/service/app/manageusers/updateUserProfile/LANG_AUTH"
  private _deleteUser: string = "/billingcentre/obpp/service/app/manageusers/deleteUserProfile/LANG_AUTH"
  private _reinstateUserProfile: string = "/billingcentre/obpp/service/app/manageusers/reinstateUserProfile/LANG_AUTH"
  private _rejectUserProfile: string = "/billingcentre/obpp/service/app/manageusers/rejectUserProfile/LANG_AUTH"
  private _approveUserProfile: string = "/billingcentre/obpp/service/app/manageusers/approveUserProfile/LANG_AUTH"
  private _sendactivationlink: string = "/billingcentre/obpp/service/app/manageusers/sendactivationlink/LANG_AUTH"
  private _viewCustomerScreen: string = "/billingcentre/obpp/service/app/viewCustomerScreen/viewCust/LANG_AUTH"
  private _getUserInfo: string = "/billingcentre/obpp/service/app/home/getUserStatus/LANG_AUTH";
  private _setPassword: string = "/billingcentre/obpp/service/app/home/setpassword/LANG_AUTH";

  private _accountStatementDownload: string = "/billingcentre/obpp/service/app/account/accountStatement/LANG_AUTH/";

  private _checkPostalCode: string = "/billingcentre/obpp/service/app/getRegisteredAccountInfo/LANG_AUTH/";

  private _unAuthCheckPostalCode: string = "/billingcentre/obpp/service/app/getUnAuthUserAccountInfo/LANG_AUTH/"

  public get setPassword(): string {
    return this._setPassword;
  }
  
  public get getUserInfo(): string {
    return this._getUserInfo;
  }

  public get accountSummaryFromAccountNumbers(): string {
    return this._accountSummaryFromAccountNumbers;
  }

  public get searchByBillOfLading(): string {
    return this._searchByBillOfLading;
  }

  public get searchByAccountNameOrAddress(): string {
    return this._searchByAccountNameOrAddress;
  }

  public get searchByAccountOrInvoice(): string {
    return this._searchByAccountOrInvoice;
  }
  
  public get dispute_InvoiceURL(): string {
    return this._dispute_InvoiceURL;
  }

  public get shipmentTrackerURL(): string {
    return this._shipmentTrackerURL;
  }

  public get cpwa_acct_summary_decrypt(): string {
    return this._cpwa_acct_summary_decrypt;
  }

  public get cpwa_acct_summary_encrypt(): string {
    return this._cpwa_acct_summary_encrypt;
  }

  public get closedAccountSummary(): string {
    return this._closedAccountSummary;
  }

  public get cpwa_payment_decrypt(): string {
    return this._cpwa_payment_decrypt;
  }

  public get invoicePDF(): string {
    return this._invoicePDF;
  }

  public get accountSummaryUser(): string {
    return this._accountSummaryUser;
  }

  public get cpwa_URL(): string {
    return this._cpwa_URL;
  }

  public get cpwa_payment_encrypt(): string {
    return this._cpwa_payment_encrypt;
  }

  public get quickpay_security_audit(): string {
    return this._quickpay_security_audit;
  }

  public get logoutURL() {
    return this._logoutURL;
  }

  public get newuserRegisteration() {
    return this._newuserRegisteration;
  }

  public get terms4UserReg() {
    return this._terms4UserReg;
  }

  public get accInfo() {
    return this._accInfo;
  }

  public get announcements() {
    return this._announcements;
  }

  public get forgotPassword() {
    return this._forgotPassword;
  }

  public get accountInfoQuickPay() {
    return this._accountInfoQuickPay;
  }

  public get accSummary() {
    return this._accSummary;
  }

  public get liveChatURL(): string {
    return this._liveChatURL;
  }

  public get authURL(): string {
    return this._authURL;
  }

  public get apiBaseURL(): string {
    return this._apiBaseURL;
  }

  public get checkEmail(): string {
    return this._checkEmail;
  }

  public get accountNumberInfo(): string {
    return this._accountNumberInfo;
  }

  public get accountIdInfo(): string {
    return this._accountIdInfo;
  }

  public get registerToAutopay(): string {
    return this._registerAutoPay;
  }

  public get setAutopay(): string {
    return this._setAutoPay;
  }

  public get autopayAccountInfo(): string {
    return this._autoPayAccountInfo;
  }

  public get userProfile() {
    return this._userProfile;
  }

  public get creditCardDetails() {
    return this._creditCardDetails;
  }

  public get creditCardInfo(): string {
    return this._creditCardInfo;
  }

  public get creditCardList(): string {
    return this._creditCardList;
  }

  public get removeAutopayAccounts(): string {
    return this._removeAutoPayAccounts;
  }

  public get saveAutoPayAccounts(): string {
    return this._saveAutoPayAccounts;
  }
  public get addCardView(): string {
    return this._addCardView;
  }

  public get saveUserProfile(): string {
    return this._saveUserProfile;
  }

  public get changePassword(): string {
    return this._changePassowrd;
  }

  public get removeCreditCard(): string {
    return this._removeCreditCard;
  }
  public get accountMasterDetails(): string {
    return this._retrieveAccountMaster;
  }

  public get updateAccountChanges(): string {
    return this._submitAccountChanges;
  }

  public get searchUsers(): string {
    return this._searchUsers;
  }

  public get createAccount(): string {
    return this._createAccount
  }

  public get updateUserProfile(): string {
    return this._updateUserProfile
  }

  public get deleteUser(): string {
    return this._deleteUser
  }

  public get reinstateUserProfile(): string {
    return this._reinstateUserProfile
  }

  public get rejectUserProfile(): string {
    return this._rejectUserProfile
  }

  public get approveUserProfile():string {
    return this._approveUserProfile
  }

  public get sendactivationlink():string {
    return this._sendactivationlink
  }

  public get CPWA_Frame_URL(): string {
    return  this._getCPWAFrameURL
  }

  public get viewCustomerScreen(): string {
    return this._viewCustomerScreen
  }

  public get acceptTermsFromEmail(): string {
    return this._accept_terms_from_email;
  }

  public get accountStatementDownload() : string {
    return this._accountStatementDownload
  }

  public get checkPostalCode() : string {
    return this._checkPostalCode
  }

  public get unAuthCheckPostalCode(): string{
    return this._unAuthCheckPostalCode
  }
}
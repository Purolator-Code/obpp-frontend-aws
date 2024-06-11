export class OBPPNewuserRegistration {

    newUserModel: NewUserRegistration = {
        accNumber: "",
        acceptTerms: false,
        accountList: [],
        accountaccess: "",
        accounts: [{
            accoutNumber: '',
            access: ''
        }],
        companyName: "",
        emailAddress: "",
        firstName: "",
        language: "",
        lastName: "",
        phoneNumber: "",
        phoneNumberExt: "",
        postalCode: ""
    };

}


export interface NewUserRegistration {
    accNumber: string;
    acceptTerms: boolean;
    accountList: any;
    accountaccess: any;
    accounts: [AccountsAccess];
    companyName: string;
    emailAddress: string;
    firstName: string;
    language: string;
    lastName: string;
    phoneNumber: string;
    phoneNumberExt: string,
    postalCode: string;
}

export interface AccountsAccess {
    accoutNumber: string;
    access: string;
}


export interface QuickPaySecurityAudit {
    accountNumber: string;
    attemptEntryPage: string;
    invoiceNumber: string;
    postalCode: string;
    status: boolean;
    userEmailId?: string | null;
}


export interface QuickPaySearchModel {
    accountNumber: string,
    invoiceNumber: string,
    blNumber: string,
    accountName: string,
    postalCode: string,
    streetName: string,
    telephone: string,
    city: string,
    treetNumber: string,
    address: string,
    partialPostCode: string,
    accountNumbers: any,
    accountInfo: any,
    selectAll: boolean
  }


  export interface setPasswordModel {
    emailAddress: string,
    password: string,
    confirmPassword: string,
    userGUID: string
  }

export class EnrollAutoPay {
    userName!: string;
    emailAddress!: string;
    companyName!: string;
    firstName!: string;
    lastName!: string;
    confirmEmailAddress!: string;
    phoneNumber!: string;
    phoneNumberExt!: string;
    userID!: string;
    appAndBcRegistrations!: boolean;
    language!: string;
    autoPayUserAccounts: AutoPayUserAccount[] = [];
    autoPayAccountDtoList: AutoPayUserAccount[] = [];
  }

export class AutoPayUserAccount {
    accountID!: string;
    creditcardid!: string;
    accountNumber!: string;
    accountName!: string;
    obppAutoPayAccountStatus!: string;
    sendSuccessfullNotificationInd!: string;
    carbonCopyEmailAddress!: string;
    targetActionDate!: string;
    targetActionDateFrontEnd!: string;
    postalCodeSAP!: string;
    postalCode!: string;
    isEditable!: boolean;
    obppPreviousAutoPayAccountStatus!: string;
} 
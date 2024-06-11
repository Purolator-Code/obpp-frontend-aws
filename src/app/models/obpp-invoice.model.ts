export class OBPPQuickPaymentModel {
    private invoiceList?: OBPPInvoiceList;
}

export interface OBPPInvoiceList {
    accountName: string,
    accountNumber: string,
    balanceDue: any,
    dueDate: string,
    emailBalanceDue: any,
    emailFRBalanceDue: any,
    emailFRPaymentAmount: any,
    emailPaymentAmount: any,
    invoiceAmount: any,
    invoiceDate: string,
    invoiceId: any,
    invoiceNumber: string,
}

export interface CPWAInvoiceList {
    accountName: string,
    accountNumber: string,
    balanceDue: any,
    dueDate: string,
    invoiceAmount: any,
    invoiceDate: string,
    invoiceNumber: string,
    note: any,
    payAmount: any,
    paymentAmount: any,
    invoiceCurrency: any
}

export interface CPWAQuickPayData {
    createMethod: string,
    invoiceList: [CPWAInvoiceList],
    paymentType: string,
    totalPayAmount: any,
    additionalEmailId: string,
    paymentCurrency: string
}



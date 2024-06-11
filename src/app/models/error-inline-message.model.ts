export class OBPPErrorInlineMessageModel {
    alerts: Alert[] = [];

}

export interface Alert {
    type: string;
    messageEn: string;
    messageFr: string;
}

export interface AccountList {
    type: string;
    accNumber: string;
    postalCode: string;
    accessdrp: string
}
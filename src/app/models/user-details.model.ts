export class UserDetailsModel {
    serviceResponse: 
        {
            roleDto: roleDto[],
            userPreferenceDto: userPreferenceDto[],
            obppUserProfileDto: obppUserProfileDto[],
            obppUserstatus: string
        }
     = 
        {
            roleDto:[],
            userPreferenceDto: [],
            obppUserProfileDto: [],
            obppUserstatus: ''
        }
    ;
    
}


export interface roleDto {
    roleId: number,
    roleName: string
}

export interface obppUserProfileDto {
    userID: number,
    status: string,
    ccToken: any,
    ccType: any,
    cLastDigits: any,
    companyName: string,
    activateDate: string,
    deactivateDate: any,
    registrationReqDate: any,
    lastLoginDate: string,
    createDate: string,
    createBy: string,
    lastModifyBy: string,
    ccExpiry: any,
    roleId: number,
    ccPayerName: any,
    convertedAccountReminderInd: boolean
}

export interface userPreferenceDto {
    userPrefID: number,
    preferenceName: string,
    preferenceValue: boolean
}
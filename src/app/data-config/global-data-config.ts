export class GlobalDataConfiguration {

    private _accessValuesEn: any = [
        {
            code: "F",
            description: "Full Access"
         },
         {
             code: "V",
             description: "View Only"
         } 
        ];
    private _accessValuesFr:any = [
        {
            code: "F",
            description: "Acces complet"
         },
         {
             code: "V",
             description: "Pas d\'acces"
         } 
        ];

    public get accessValuesFr() {
        return this._accessValuesFr;
    }
    public set accessValuesFr(value) {
        this._accessValuesFr = value;
    }


    public get accessValuesEn() {
        return this._accessValuesEn;
    }
    public set accessValuesEn(value) {
        this._accessValuesEn = value;
    }

    
    

}
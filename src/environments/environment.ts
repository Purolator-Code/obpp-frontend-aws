// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  title: 'Purolator - Billing Centre',
  apiURL: 'https://dev-be.aws-purolator.com',
  frightSearchEnURL: 'https://cert.freight.purolator.com/scripts/cgiip.exe/WService=wsbroker1/reftrace2.htm?language=english&seskey=&wbtn=BOL&nav=top&prolist=KEY_PIN_NUMBER',
  frightSearchFrURL: 'https://cert.freight.purolator.com/scripts/cgiip.exe/WService=wsbroker1/reftrace2.htm?language=french&seskey=&wbtn=BOL&nav=top&prolist=KEY_PIN_NUMBER',
  courierSearchEnURL: 'https://stg.purolator.com/en/tracker?pin=KEY_PIN_NUMBER',
  courierSearchFrURL: 'https://stg.purolator.com/fr/tracker?pin=KEY_PIN_NUMBER',
  puroInternationalURL: 'https://purolatorqa.ts2000.net/login/quicktrack/KEY_PIN_NUMBER',
  gscsURL: 'https://purolatorqa.ts2000.net/login/quicktrack/KEY_PIN_NUMBER',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

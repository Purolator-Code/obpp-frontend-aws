import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ViewChild,
  ElementRef,
  HostListener,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { LocalStorageService } from 'src/app/services/global/local-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Alert } from '../../../models/error-inline-message.model';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
import { OBPPUserRegisterService } from 'src/app/services/user-register/user-register.service';
import { faBullseye } from '@fortawesome/free-solid-svg-icons';
import { SharedService } from 'src/app/services/login-page/shared-service';

@Component({
  selector: 'obpp-header',
  templateUrl: './obpp-header.component.html',
  styleUrls: ['./obpp-header.component.scss'],
})
export class OBPPHeaderComponent implements OnInit, AfterViewInit
 {
  isRegister: boolean = false;
  activeTab: string = '';
  activeIdString: string = ''
  showAlert: boolean = false;
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    this.restoreStateBasedOnUrl();
  }

  restoreStateBasedOnUrl() {
    const path = this.location.path();
    this.activeIdString = path;
    this.dataSharingService.activeIdString.next(path);
    this.dataSharingService.enrollForAutoPay.next([]);
    if (path === '/csr/viewCustomerScreen') {
      this.activeTab = 'viewCustomerScreen';
    }
    else if (path === '/manageusers') {
      this.activeTab = 'manageusers';
    }
    else if (path === '/csr/transaction') {
      this.activeTab = 'transactionlog';
    }
    else if (path === '/csr/loosebills') {
      this.activeTab = 'loosebills';
    }
    else if (path === '/csr/quickpay') {
      this.activeTab = 'quickpay';
    }
    else if (path === '/csr/notification') {
      this.activeTab = 'notificationlog';
    }  
  }

  @ViewChild('loginQuickpay')
  loginQuickpay!: ElementRef;

  @Output() langClick = new EventEmitter();
  @Input() langLabel: string = '';
  alerts: Alert[] = [];
  liveChatEnURL: string = '';
  liveChatFrURL: string = '';
  usernameHeader: string = '';
  isHomePage: boolean = true;
  isLoggedUser: boolean = false;
  isAdminUser: boolean = false;
  isLoading = true;
  isPaymentInProgress = false;
  userGUID: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private localStorageService: LocalStorageService,
    public translate: TranslateService,
    private obppLoginService: OBPPLoginService,
    private location: Location,
    private dataSharingService: DataSharingService,
    private obppUserRegisterService: OBPPUserRegisterService,
    private sharedService: SharedService
  ) {
    this.dataSharingService.isUserLoggedIn.subscribe((value) => {
      if (value) {
        this.isLoggedUser = true;
        this.isHomePage = false;
        this.updateUserName();
      } else if (
        !this.location.path().startsWith('?lang=') ||
        !this.location.path().startsWith('?id=') ||
        this.location.path() == '/' ||
        this.location.path() == '' ||
        this.location.path() == '/home'
      ) {
        this.isHomePage = true;
      } else {
        this.isHomePage = false;
        this.updateUserName();
      }
    });

    this.dataSharingService.isAdminLoggedIn.subscribe((value) => {
      if (value) {
        this.isAdminUser = true;
        this.isHomePage = false;
        this.activeTab = 'manageusers';
        this.updateUserName();
      } else if (
        !this.location.path().startsWith('?lang=') ||
        !this.location.path().startsWith('?id=') ||
        this.location.path() == '/' ||
        this.location.path() == '' ||
        this.location.path() == '/home'
      ) {
        this.isHomePage = true;
      } else {
        this.isHomePage = false;
        this.updateUserName();
      }
    });

    this.dataSharingService.isRefreshRequired.subscribe((value) => {
      if (
        !this.location.path().startsWith('?lang=') ||
        !this.location.path().startsWith('?id=') ||
        value == 'home' ||
        this.location.path() == '/' ||
        this.location.path() == '' ||
        this.location.path() == '/home'
      ) {
        this.isHomePage = true;
      } else {
        this.isHomePage = false;
        this.updateUserName();
      }
    });

    this.dataSharingService.IsLoadingEnabled.subscribe((v) => {
      this.isLoading = v;
    });

    this.dataSharingService.isPaymentInProgress.subscribe((v) => {
      this.isPaymentInProgress = v;
    });
  }
  ngOnInit() {
    this.sharedService.localStorageChanges$.subscribe(() => {
      this.langLabel=this.localStorageService.get('lang');
    });
    this.isLoading = true;
    this.restoreStateBasedOnUrl();
    forkJoin([
      this.obppLoginService.gteAnnouncements(),
      this.obppLoginService.getLiveChatURL(),
      this.obppLoginService.getCPWAURL(),
    ]).subscribe({
      next: (result) => {
        if (result[1]) {
          this.liveChatEnURL = result[1].serviceResponse.object.dataPropSrcEn;
          this.liveChatFrURL = result[1].serviceResponse.object.dataPropSrcFr;
        }

        if (result[2]) {
          this.obppLoginService.cpwaPaymentURL =
            result[2].serviceResponse.object;
        }

        if (result[0]) {
          result[0].serviceResponse.object.forEach((ele: any) => {
            if (ele.englishText === '?'){
              this.showAlert = false;
            }else {
              this.showAlert = true
            }
            this.alerts.push({
              type: 'danger',
              messageEn: ele.englishText,
              messageFr: ele.frenchText,
            });
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error ', error);
      },
    });

    this.activatedRoute.queryParamMap.subscribe((data) => {
      this.userGUID = data.get('id');
      if (data.get('lang') == 'fr') {
        this.translate.setDefaultLang('fr');
        this.localStorageService.set('lang', 'fr');
      } else if (data.get('lang') == 'en') {
        this.translate.setDefaultLang('en');
        this.localStorageService.set('lang', 'en');
      }
      this.dataSharingService.qParamEmailId.next('');
      if (this.userGUID != null && this.userGUID) {
        this.isLoading = true;
        this.obppUserRegisterService.getUserInfo(this.userGUID).subscribe({
          next: (res) => {
            if (
              res.serviceResponse.type != 'error' &&
              res.serviceResponse.type != 'fieldErrors'
            ) {
              if (
                res.serviceResponse?.object?.language == 'FR' ||
                res.serviceResponse?.object?.language == 'fr'
              ) {
                this.translate.setDefaultLang('fr');
                this.localStorageService.set('lang', 'fr');
              } else {
                this.translate.setDefaultLang('en');
                this.localStorageService.set('lang', 'en');
              }
              this.dataSharingService.qParamEmailId.next(
                res.serviceResponse?.object?.emailAddress
              );
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error in getting user info using GUID - Head');
            this.isLoading = false;
          },
        });
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSharingService.activeIdString.subscribe((aid) => {
      if (aid === '/user/account-summary') {
        this.navigatetab('accounts', 'component');
      } else if (aid === '/user/account-dispute') {
        this.navigatetab('dispute', 'component');
      } else if (aid === '/user/manage-accounts') {
        this.navigatetab('manageBilling', 'component');
      } else if (aid === '/user/autopay') {
        this.navigatetab('autoPay', 'component');
      } else if (aid === '/user/user-profile') {
        this.navigatetab('profile', 'component');
      } else if (aid === '/manageusers')
        this.navigatetab('manageusers', 'component');
      else if (aid === '/csr/viewCustomerScreen')
        this.activeTab = 'viewCustomerScreen';
    });
  }

  updateUserName() {
    if (!this.isHomePage) {
      this.usernameHeader = this.obppLoginService.getUserName();
    }
  }

  openLiveChat() {
    if (this.langLabel.toLowerCase() === 'en') {
      window.open(this.liveChatEnURL, 'Purolator', 'width=400,height=480');
    } else {
      window.open(this.liveChatFrURL, 'Purolator', 'width=400,height=480');
    }
  }

  updateNotHome() {
    this.isHomePage = false;
    this.isRegister = true;
  }

  homeLink() {
    this.isHomePage = true;
    this.isRegister = false;
  }
  position(obj: any) {
    let currenttop = 0;
    if (obj.offsetParent) {
      do {
        currenttop += obj.offsetTop;
      } while ((obj = obj.offsetParent));
    }
    return currenttop;
  }

  scrollToLogin() {
    const scroll = this.loginQuickpay.nativeElement;
    const position = this.position(scroll);
    window.scroll(0, position);
  }

  logout() {
    this.isLoading = true;
    this.obppLoginService.clearCache(this.usernameHeader).subscribe({
      next: (res) => {
        window.location.reload();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Logging out fails!!!');
        this.router.navigateByUrl('/');
        window.location.reload();
        this.isLoading = false;
      },
    });
  }

  updateActiveId(aid: string) {
    this.dataSharingService.activeIdString.next(aid);
    this.activeTab = 'accounts';
  }

  navigatetab(tab: string, place: string) {
    if (tab === 'accounts') {
      this.activeTab = tab;

      if (place !== 'component') {
        this.router.navigateByUrl('/user/account-summary');
        this.dataSharingService.activeIdString.next('/user/account-summary');
      }
    } else if (tab === 'dispute') {
      this.activeTab = tab;
      if (place !== 'component') {
        this.router.navigateByUrl('/user/account-dispute');
        this.dataSharingService.activeIdString.next('/user/account-dispute');
      }
    } else if (tab === 'manageBilling') {
      this.activeTab = tab;
      if (place !== 'component') {
        this.router.navigateByUrl('/user/manage-accounts');
        this.dataSharingService.activeIdString.next('/user/manage-accounts');
      }
    } else if (tab === 'autoPay') {
      this.activeTab = tab;
      if (place !== 'component') {
        this.router.navigateByUrl('/user/autopay');
        this.dataSharingService.activeIdString.next('/user/autopay');
      }
    } else if (tab === 'profile') {
      this.activeTab = tab;
      if (place !== 'component') {
        this.router.navigateByUrl('/user/user-profile');
        this.dataSharingService.activeIdString.next('/user/user-profile');
      }
    }

    if (tab === 'viewCustomerScreen') {
      this.activeTab = tab;
      if (place !== 'component') {
        this.router.navigateByUrl('/csr/viewCustomerScreen');
        this.dataSharingService.activeIdString.next('/csr/viewCustomerScreen');
      }
    } else if (tab === 'manageusers') {
      this.activeTab = tab;
      if (place !== 'component') {
        this.router.navigateByUrl('/manageusers');
        this.dataSharingService.activeIdString.next('/manageusers');
      }
    } else if (tab === 'transactionlog') {
      this.activeTab = tab;
      if (place !== 'component') {
        this.router.navigateByUrl('/csr/transaction');
        this.dataSharingService.activeIdString.next('/csr/transaction');
      }
    } else if (tab === 'loosebills') {
      this.activeTab = tab;
      if (place !== 'component') {
        this.router.navigateByUrl('/csr/loosebills');
        this.dataSharingService.activeIdString.next('/csr/loosebills');
      }
    } else if (tab === 'quickpay') {
      this.activeTab = tab;
      if (place !== 'component') {
        this.router.navigateByUrl('/csr/quickpay');
        this.dataSharingService.activeIdString.next('/csr/quickpay');
      }
    } else if (tab === 'notificationlog') {
      this.activeTab = tab;
      if (place !== 'component') {
        this.router.navigateByUrl('/csr/notification');
        this.dataSharingService.activeIdString.next('/csr/notification');
      }
    }
  }
}

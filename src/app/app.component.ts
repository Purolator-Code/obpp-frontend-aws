import { Component, HostListener } from '@angular/core';
import { LocalStorageService } from './services/global/local-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { NavigationStart, Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataSharingService } from './services/login-page/data-sharing.service';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  component_ref: any;
  lang = "en";
  langLabel = "";
  timeout = 895;
  userActive = false;

  constructor(
    private router: Router,
    private localStorageService: LocalStorageService,
    public translate: TranslateService,
    private title: Title,
    private dataSharingService: DataSharingService,
    private idle: Idle,
  ) {
    this.setupIdleTimeout();
    this.reset();

    if (this.localStorageService.get("lang") !== null) {
      this.translate.setDefaultLang(this.localStorageService.get("lang"));
      let label = this.localStorageService.get("lang");
      if (label == "en") {
        this.langLabel = "en"
      } else if (label == "fr") {
        this.langLabel = "fr"
      } else {
        this.langLabel = "en";
      }
    } else {
      this.langLabel = "en";
      this.localStorageService.set("lang", "en");
      this.translate.setDefaultLang("en");
    }
    this.setTitle();
  }

  ngOnInit() {
    this.handleLanguageAndRedirection();
    window.addEventListener('hashchange', () => this.handleLanguageAndRedirection(), false);
  }
  handleLanguageAndRedirection() {
    const currentPath = window.location.hash;
    if (currentPath === '#/lfr') {
      this.langLabel = 'fr';
      this.localStorageService.set("lang", 'fr');
      this.translate.setDefaultLang('fr');
    }
    if (currentPath === '#/') {
      this.langLabel = 'en';
      this.localStorageService.set("lang", 'en');
      this.translate.setDefaultLang('en');
    }
    this.setTitle();
  }
  
  setupIdleTimeout() {
    this.idle.setIdle(this.timeout);
    this.idle.setTimeout(5);
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    this.idle.onTimeout.subscribe(() => {
      if (!this.userActive) {
        this.reloadPage();
      }
    });
  }

  reset() {
    this.idle.watch();
    this.userActive = false;
  }

  reloadPage() {
    window.location.reload();
  }

  @HostListener('window.mousemove', ['$event'])
  @HostListener('window.keydown', ['$event'])
  onUserActivity(event: any) {
    this.userActive = true;
  }

  setTitle() {
    this.translate.get("PUROLATOR_TITLE").subscribe(tit=> {
      this.title.setTitle(tit);
    });
  }

  persist(key: string, value: any) {
    this.localStorageService.set(key, value);
  }

  langClick(event: any) {
    this.translate.setDefaultLang(event);
    this.setTitle();
    this.localStorageService.set("lang", event);
  }


  onActivate(componentReference: any) {
    this.component_ref=componentReference;
  }

  test() {
    this.router.navigateByUrl("/user/autopay");
    this.dataSharingService.isRefreshRequired.next('yes');
  }


}

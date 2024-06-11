import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';

@Component({
  selector: 'obpp-csr-home',
  templateUrl: './obpp-csr-home.component.html',
  styleUrls: ['./obpp-csr-home.component.scss'],
})
export class OBPPCsrHomeComponent implements OnInit {
  content?: string;

  fieldErrorsObj = [];

  constructor(
    public router: Router,
    private translate: TranslateService,
    private dataSharingService: DataSharingService,
    private obppLoginService: OBPPLoginService
  ) {}

  ngOnInit() {
    this.dataSharingService.isAdminLoggedIn.subscribe((v) => {
      if (!v) {
        this.router.navigateByUrl('/home');
        this.goHome();
      }
    });
  }

  goHome() {
    this.dataSharingService.IsLoadingEnabled.next(true);
    this.obppLoginService
      .clearCache(this.obppLoginService.getUserName())
      .subscribe({
        next: (d) => {
          this.dataSharingService.IsLoadingEnabled.next(false);
        },
        error: (error) => {
          console.log('Issue in Logging out!!!');
          this.dataSharingService.IsLoadingEnabled.next(false);
          window.location.reload();
        },
      });
  }

  updateErrorMessage(event: any) {
    this.fieldErrorsObj = event;
  }
}

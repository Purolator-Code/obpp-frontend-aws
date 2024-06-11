import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';

@Component({
  selector: 'obpp-user-home',
  templateUrl: './obpp-user-home.component.html',
  styleUrls: ['./obpp-user-home.component.scss'],
})
export class OBPPUserHomeComponent implements OnInit {
  content?: string;

  fieldErrorsObj = [];

  constructor(
    public router: Router,
    private dataSharingService: DataSharingService,
    private obppLoginService: OBPPLoginService
  ) {}

  ngOnInit() {
    this.dataSharingService.isUserLoggedIn.subscribe((v) => {
      if (!v) {
        this.dataSharingService.IsLoadingEnabled.next(true);
        this.router.navigateByUrl('/home');
        this.obppLoginService
          .clearCache(this.obppLoginService.getUserName())
          .subscribe({
            next: (d) => {
              this.dataSharingService.IsLoadingEnabled.next(false);
            },
            error: (error) => {
              this.dataSharingService.IsLoadingEnabled.next(false);
              window.location.reload();
            },
          });
      }
    });
  }

  updateErrorMessage(event: any) {
    this.fieldErrorsObj = event;
  }
}

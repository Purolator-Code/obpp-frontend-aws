import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
@Component({
  selector: 'obpp-user-tabs',
  templateUrl: './obpp-user-tabs.component.html',
  styleUrls: ['./obpp-user-tabs.component.scss'],
})
export class ObppUserHomeTabsComponent implements OnInit {
  links = [
    { title: 'ACC_SUMMARY', fragment: '/user/account-summary' },
    { title: 'DISPUTE', fragment: '/user/account-dispute' },
    { title: 'MANAGE_BC_ACC', fragment: '/user/manage-accounts' },
    { title: 'WEEKLY_PGM', fragment: '/user/autopay' },
    { title: 'PROFILE', fragment: '/user/user-profile' },
  ];
  activeIdString = '/user/autopay';
  isAdmin: boolean = false;
  isViewCustScreen: boolean = false;

  constructor(
    private translate: TranslateService,
    public route: ActivatedRoute,
    public dataSharingService: DataSharingService
  ) {}

  ngOnInit(): void {
    this.dataSharingService.activeIdString.subscribe((aid) => {
      this.activeIdString = aid;
    });
  }

  updateActiveId(aid: string) {
    this.activeIdString = aid;
    this.dataSharingService.activeIdString.next(aid);
    this.dataSharingService.enrollForAutoPay.next([])
  }
}

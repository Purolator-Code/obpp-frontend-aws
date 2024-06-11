import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';

@Component({
  selector: 'obpp-view-userScreen-tabs',
  templateUrl: './obpp-view-userscreen-tabs.component.html',
  styleUrls: ['./obpp-view-userScreen-tabs.component.scss'],
})
export class ObppViewUserHomeTabsComponent implements OnInit {
  links = [
    { title: 'ACC_SUMMARY', fragment: '/csr/viewCustomerScreen/account-summary' },
    { title: 'DISPUTE', fragment: '/csr/viewCustomerScreen/account-dispute' },
    { title: 'MANAGE_BC_ACC', fragment: '/csr/viewCustomerScreen/manage-accounts' },
    { title: 'WEEKLY_PGM', fragment: '/csr/viewCustomerScreen/autopay' }
  ];
  activeIdString = "/user/autopay";
  isAdmin: boolean = false;
  isViewCustScreen: boolean = false;
  
  constructor(
    private translate: TranslateService,
    public route: ActivatedRoute,
    public dataSharingService: DataSharingService
    ) {
      
    }

  ngOnInit(): void {
    this.dataSharingService.activeIdString.subscribe(aid => {
      this.activeIdString = aid;
    })
  }

  updateActiveId(aid: string) {
    this.activeIdString = aid;
  }

  
}

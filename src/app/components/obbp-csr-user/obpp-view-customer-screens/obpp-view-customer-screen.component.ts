import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
import { AdminViewCustomerScreenService } from 'src/app/services/admin-view-customer-screen/admin-view-customer-screen.services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-obpp-notification-log',
  templateUrl: './obpp-view-customer-screen.component.html',
  styleUrls: ['./obpp-view-customer-screen.component.css'],
})
export class viewCustomerScreenComponent implements OnInit, OnDestroy {
  viewCustomerScreenForm: FormGroup;
  manageUsersEmailId: string = '';
  emailId: string = '';
  emailSubscription!: Subscription;
  isShowEmailIdNotFind: boolean = false;
  showCustomerScreen: boolean = false;

  emailRegex =
    '[a-zA-Z0-9_+S-]*(?=[a-zA-Z0-9](?![.]{2}).+)([a-zA-Z0-9_+.S-])*([a-zA-Z0-9-S_+S-]+)\\@(([a-zA-Z0-9-S])+\\.)+([a-zA-Z0-9S]{2,10})';

  constructor(
    private obppLoginService: OBPPLoginService,
    private fb: FormBuilder,
    public translate: TranslateService,
    public router: Router,
    private route: ActivatedRoute,
    private dataSharingService: DataSharingService,
    private adminViewCustomerScreenService: AdminViewCustomerScreenService,
    private obbpLoginService: OBPPLoginService
  ) {
    this.viewCustomerScreenForm = this.fb.group({
      emailAddress_viewCustomerScreen: [
        '',
        [Validators.required, Validators.pattern('^' + this.emailRegex + '$')],
      ],
    });
  }

  ngOnInit(): void {
    this.viewCustomerScreenForm
      .get('emailAddress_viewCustomerScreen')
      ?.setValue('');
    this.emailSubscription = this.dataSharingService.sendEmailId.subscribe(
      (email) => {
        this.emailId = email;
        if (this.emailId) {
          this.viewCustomerScreenForm
            .get('emailAddress_viewCustomerScreen')
            ?.setValue(this.emailId);
          this.onView('');
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.emailSubscription.unsubscribe();
  }

  onView(event: any) {
    this.showCustomerScreen = false;
    this.isShowEmailIdNotFind = false;
    this.obppLoginService.lookupUserName = '';
    this.emailId = this.viewCustomerScreenForm.get(
      'emailAddress_viewCustomerScreen'
    )?.value;

    if (this.emailId !== '') {
      this.adminViewCustomerScreenService
        .viewCustomerScreen(this.obbpLoginService.getAuthToken(), this.emailId)
        .subscribe({
          next: (data: any) => {
            if (data?.serviceResponse?.type === 'success') {
              this.obppLoginService.lookupUserName = this.emailId;
              this.obppLoginService.isViewOnly = true;
              this.showCustomerScreen = true;
              this.router.navigate(
                ['/csr/viewCustomerScreen/account-summary'],
                { relativeTo: this.route }
              );
              this.dataSharingService.activeIdString.next(
                '/csr/viewCustomerScreen/account-summary'
              );
            } else {
              this.isShowEmailIdNotFind = true;
            }
            this.dataSharingService.sendEmailId.next('');
          },
          error: (error: any) => {
            console.error(error);
          },
        });
    }
  }

  onKeyUpEvent(event: any) {
    this.isShowEmailIdNotFind = false;
  }

  reset() {
    this.viewCustomerScreenForm.reset();
  }
}

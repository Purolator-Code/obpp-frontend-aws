import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { setPasswordModel } from 'src/app/models/new-user-registration.model';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
import { OBPPUserRegisterService } from 'src/app/services/user-register/user-register.service';

@Component({
  selector: 'obpp-active-user',
  templateUrl: './obpp-active-user.component.html',
  styleUrls: ['./obpp-active-user.component.scss'],
})
export class OBPPActiveUser implements OnInit {
  isErrorInLoading: boolean = false;
  errMsgList: any = [];
  submitted: boolean = false;
  ActiveForm: FormGroup;
  pwdMisMatch: boolean = false;
  userGUID: any;
  setPasswordData?: setPasswordModel;
  emailAddress: string = '';
  successSetPassword = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private obppUserRegisterService: OBPPUserRegisterService,
    private dataSharingService: DataSharingService,
    private translateService: TranslateService
  ) {
    this.ActiveForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,7}$'),
        ],
      ],
      password: ['', Validators.required],
      confirmpassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.successSetPassword = false;
    this.dataSharingService.IsLoadingEnabled.next(true);
    this.errMsgList = [];
    this.activatedRoute.queryParamMap.subscribe((data) => {
      this.userGUID = data.get('id');
      console.log(this.userGUID);
      this.emailAddress = '';
      //if id=null then we can redirect to the home page
      if (this.userGUID != null && this.userGUID) {
        this.dataSharingService.qParamEmailId.subscribe((v) => {
          this.emailAddress = v;
        });
      } else {
        this.dataSharingService.IsLoadingEnabled.next(false);
      }
    });
  }

  validateFields() {
    let pwd = this.ActiveForm.get('password')?.value;
    let cpwd = this.ActiveForm.get('confirmpassword')?.value;
    this.pwdMisMatch = false;
    if (pwd != '' && cpwd != '') {
      if (pwd != cpwd) {
        this.pwdMisMatch = true;
      }
    }
  }

  setPassword(event: any) {
    this.submitted = true;
    this.validateFields();

    if (
      !this.ActiveForm.get('password')?.invalid &&
      !this.ActiveForm.get('confirmpassword')?.invalid &&
      !this.pwdMisMatch
    ) {
      this.setPasswordData = {
        emailAddress: this.emailAddress,
        password: this.ActiveForm.get('password')?.value,
        confirmPassword: this.ActiveForm.get('confirmpassword')?.value,
        userGUID: this.userGUID,
      };
      this.dataSharingService.IsLoadingEnabled.next(true);
      this.errMsgList = [];
      this.obppUserRegisterService.setPassword(this.setPasswordData).subscribe(
        (res) => {
          if (res.serviceResponse.type == 'fieldErrors') {
            res.serviceResponse.object.fieldErrors.forEach((e: any) => {
              this.errMsgList.push({
                value: e.message,
              });
            });
          } else if (res.serviceResponse.type == 'error') {
            this.errMsgList.push({
              value: res.serviceResponse.message,
            });
          } else {
            this.successSetPassword = true;
          }

          this.dataSharingService.IsLoadingEnabled.next(false);
        },
        (error) => {
          console.log('Error in Setting Password Submit action', error);
          this.dataSharingService.IsLoadingEnabled.next(false);
        }
      );
    }
  }

  navigateToLoginPage() {
    this.router.navigateByUrl('/');
  }
}

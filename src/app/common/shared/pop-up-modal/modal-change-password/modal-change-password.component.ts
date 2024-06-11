import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
import { UserProfileService } from 'src/app/services/user-profile/user-profile.service';

@Component({
  selector: 'app-modal-change-password',
  templateUrl: './modal-change-password.component.html',
  styleUrls: ['./modal-change-password.component.scss'],
})
export class ModalChangePasswordComponent {
  @Input() my_modal_title: string = '';
  @Input() my_modal_content: string = '';
  @Input() modal_desc: string = '';
  @Input() firstButtonLabel: string = '';
  @Input() secondButtonLabel: string = '';
  @Input() modalType: string = '';
  @Input() user_data: any;
  @Output() successAction = new EventEmitter();
  @Output() cancelAction = new EventEmitter();
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  changeForm!: FormGroup;
  displayErrorMsgBlock: boolean = false;
  errMsg: string []  = [];
  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private dataSharingService: DataSharingService
  ) {
    this.changeForm = this.fb.group({
      currentPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(25),
        ],
      ],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(25),
        ],
      ],
      confirmPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(25),
        ],
      ],
    });
  }

  successActionFunc(changePasswordData: any) {
    
    if (this.changeForm.valid && this.changeForm.dirty) {
      this.user_data.currentPassword =
        this.changeForm.get('currentPassword')?.value;
      this.user_data.newPassword = this.changeForm.get('newPassword')?.value;
      this.user_data.confirmPassword =
        this.changeForm.get('confirmPassword')?.value;
      const postData = this.user_data;
      this.displayErrorMsgBlock = false;
      this.dataSharingService.IsLoadingEnabled.next(true);
      this.errMsg=[];
      this.userProfileService.changePassword(postData).subscribe({
        next: (res) => {
          if (res.serviceResponse.type === 'success') {
            this.activeModal.close('OK');
            this.dataSharingService.IsLoadingEnabled.next(false);
            this.successAction.emit();
          } else {
            this.displayErrorMsgBlock = true;
            if(res.serviceResponse.message!=null){
            this.errMsg.push(res.serviceResponse.message);
            }else if (res.serviceResponse.type=='fieldErrors' && res.serviceResponse.object){
              this.displayErrorMsgBlock=true;
              res.serviceResponse.object.fieldErrors.forEach((errors: any)=>{
                this.errMsg.push(errors.message);
              });
            }
            this.dataSharingService.IsLoadingEnabled.next(false);
          }
        },
        error: (err) => {
          console.error(err);
          this.dataSharingService.IsLoadingEnabled.next(false);
        },
      });
    }
  }

  cancelActionFunc() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.cancelAction.emit('');
    this.activeModal.close('Cancel');
  }
}

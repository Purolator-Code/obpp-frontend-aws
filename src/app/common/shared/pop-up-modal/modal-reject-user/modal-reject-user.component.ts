import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminManageUsersService } from 'src/app/services/admin-manage-users/admin-manage-users.service';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';

@Component({
  selector: 'app-modal-reject-user',
  templateUrl: './modal-reject-user.component.html',
  styleUrls: ['./modal-reject-user.component.scss']
})
export class ModalRejectUserComponent implements OnInit {
  @Input() user_data: any;
  @Input() modalType: string = '';
  @Output() successAction = new EventEmitter();
  @Output() cancelAction = new EventEmitter();
  @ViewChild('rejectJustification')
  rejectJustification!: ElementRef
  displayErrorMsgBlock: boolean = false;
  errMsg: string = '';
  constructor(
    public activeModal: NgbActiveModal,
    private dataSharingService: DataSharingService,
    private manageUsersService: AdminManageUsersService,
    private obbpLoginService: OBPPLoginService
  ) { }

  ngOnInit(): void {
  }

  confirmUserRejection() {
    const rejectJustification = this.rejectJustification.nativeElement.value;
    if (rejectJustification) {
      this.displayErrorMsgBlock = false;
      this.dataSharingService.IsLoadingEnabled.next(true);
      this.manageUsersService.rejectUserProfile(this.user_data, this.obbpLoginService.getAuthToken()).subscribe((data) => {
        this.dataSharingService.IsLoadingEnabled.next(false);
        this.successAction.emit(rejectJustification);
        this.activeModal.close('Success');

      }, error => {
        console.error(error);
        this.dataSharingService.IsLoadingEnabled.next(false);
        this.activeModal.close('Success');
      })
    } else {
      this.displayErrorMsgBlock = true;
      this.errMsg = 'Please add reason to reject user'
    }
  }
  cancelUserRejection() {
    this.activeModal.close('Cancel');
  }

}

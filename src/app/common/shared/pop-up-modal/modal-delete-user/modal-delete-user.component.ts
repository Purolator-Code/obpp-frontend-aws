import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminManageUsersService } from 'src/app/services/admin-manage-users/admin-manage-users.service';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';

@Component({
  selector: 'app-modal-delete-user',
  templateUrl: './modal-delete-user.component.html',
  styleUrls: ['./modal-delete-user.component.scss']
})
export class ModalDeleteUserComponent implements OnInit {
  @Input() user_data: any;
  @Input() modalType: string = '';
  @Output() successAction = new EventEmitter();
  @Output() cancelAction = new EventEmitter();
  @ViewChild('deleteJustification')
  deleteJustification!: ElementRef
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

  confirmUserDelete() {
    const deleteJustification = this.deleteJustification.nativeElement.value;
    if (deleteJustification) {
      this.displayErrorMsgBlock = false;
      this.dataSharingService.IsLoadingEnabled.next(true);
      this.manageUsersService.deleteUser(this.user_data, this.obbpLoginService.getAuthToken()).subscribe((data)=>{
        this.dataSharingService.IsLoadingEnabled.next(false);
        console.log(data.serviceResponse);
        this.successAction.emit(deleteJustification);
        this.activeModal.close('Success');
       
      }, error => {
        console.error(error);
        this.dataSharingService.IsLoadingEnabled.next(false);
        this.activeModal.close('Success');
      })
    }else {
      this.displayErrorMsgBlock = true;
      this.errMsg = 'Please add reason to delete user'
    }
  }
  cancelUserDelete() {
    this.activeModal.close('Cancel');
  }
}

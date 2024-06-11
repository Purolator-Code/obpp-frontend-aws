import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminManageUsersService } from 'src/app/services/admin-manage-users/admin-manage-users.service';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
import { OBPPLoginService } from 'src/app/services/login-page/login-page.service';

@Component({
  selector: 'app-modal-send-temp-pwd',
  templateUrl: './modal-send-temp-pwd.component.html',
  styleUrls: ['./modal-send-temp-pwd.component.scss']
})
export class ModalSendTempPwdComponent implements OnInit {
  @Input() user_data: any;
  @Input() modalType: string = '';
  @Output() successAction = new EventEmitter();
  displaySendPasswordErrorMsgBlock: boolean = false;
  displaySendPasswordErrorMsgList: string[] = [];
  // rest call handling
  REST_ERROR = "error";
  REST_SUCCESS = "success";
  constructor(
    private manageUserService: AdminManageUsersService,
    private obbpLoginService: OBPPLoginService,
    public activeModal: NgbActiveModal,
    private datasharingservice: DataSharingService
  ) { }

  ngOnInit(): void {
  }

  setSendPasswordErrorMessageList(fieldErrorsObj : any) {
    this.displaySendPasswordErrorMsgList  = [];
    this.displaySendPasswordErrorMsgList.push(fieldErrorsObj)
  };

  confirmSendTempPassword() {
    this.datasharingservice.IsLoadingEnabled.next(true)
    console.log(this.user_data);
    
    this.manageUserService.sendactivationlink(this.user_data, this.obbpLoginService.getAuthToken()).subscribe((data) => {
      if (data != null) {
        if (data.serviceResponse.type == this.REST_ERROR) {
          this.datasharingservice.IsLoadingEnabled.next(false)
          let fieldErrorsObj = data.serviceResponse.message;
          this.setSendPasswordErrorMessageList(fieldErrorsObj);
          this.displaySendPasswordErrorMsgBlock = true;
        } else if (data.serviceResponse.type == this.REST_SUCCESS) {
          this.datasharingservice.IsLoadingEnabled.next(false)
          this.successAction.emit(data)
          this.activeModal.close()
        } else if (data.serviceResponse.type == "fieldErrors") {
          //custom messages to be shown on the pop up
          this.datasharingservice.IsLoadingEnabled.next(false)
          let fieldErrorsObj = data.serviceResponse.object.fieldErrors;
          this.setSendPasswordErrorMessageList(fieldErrorsObj);
          this.displaySendPasswordErrorMsgBlock = true;
        }
      }
    }, error=>{
      this.datasharingservice.IsLoadingEnabled.next(false)
      console.error(error);
    })
  }

  closeSendTempPasswordModal() {
    this.activeModal.close()
  }

}

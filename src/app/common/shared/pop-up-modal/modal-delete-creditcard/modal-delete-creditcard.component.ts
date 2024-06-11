import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LocalStorageService } from 'src/app/services/global/local-storage.service';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
import { UserProfileService } from 'src/app/services/user-profile/user-profile.service';

@Component({
  selector: 'app-modal-delete-creditcard',
  templateUrl: './modal-delete-creditcard.component.html',
  styleUrls: ['./modal-delete-creditcard.component.scss'],
})
export class ModalDeleteCreditcardComponent implements OnInit {
  @Input() removeAccount: any;
  @Output() cancelAction = new EventEmitter();
  @Output() successAction = new EventEmitter();
  userEmail: string = '';

  constructor(
    public activeModal: NgbActiveModal,
    private userProfileService: UserProfileService,
    private localStorageService: LocalStorageService,
    private dataSharingService: DataSharingService
  ) {}

  ngOnInit(): void {
    const email = this.localStorageService.get(window.btoa('obppusername'));
    this.userEmail = window.atob(email);
  }

  populateAccountAndConfirmRemove() {
    this.dataSharingService.IsLoadingEnabled.next(true);
    this.userProfileService
      .removeCreditCard(this.removeAccount)
      .subscribe((res) => {
        console.log(res);
        this.dataSharingService.IsLoadingEnabled.next(false);
      },(error: any)=>{
        console.error(error);

      });
      this.successAction.emit("");
      this.activeModal.close("OK");
  }
  cancelAccountRemoval() {
    this.cancelAction.emit("");
    this.activeModal.close("Cancel");
  }
}

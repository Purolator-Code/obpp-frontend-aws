import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-model-delete-enrolledautopayuser',
  templateUrl: './model-delete-enrolledautopayuser.component.html',
  styleUrls: ['./model-delete-enrolledautopayuser.component.css'],
})
export class ModelDeleteEnrolledautopayuserComponent{
  constructor(public activeModal: NgbActiveModal) {}

  cancelAccountRemoval() {
    this.activeModal.close('OK');
  }
}

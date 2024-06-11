import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-temppwd-success',
  templateUrl: './modal-temppwd-success.component.html',
  styleUrls: ['./modal-temppwd-success.component.scss']
})
export class ModalTemppwdSuccessComponent implements OnInit {
  @Input() user_data: any;
  @Input() modalType: string = '';
  @Output() successAction = new EventEmitter();
  constructor(
    private activeModal: NgbActiveModal,
  ) {}

  ngOnInit(): void {
  }

  closeTempPasswordSuccessModal() {
    this.successAction.emit('')
    this.activeModal.close();
  }

}

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-terms-condition',
  templateUrl: './modal-terms-condition.component.html',
  styleUrls: ['./modal-terms-condition.component.scss']
})
export class ModalTermsConditionComponent implements OnInit {

  @Input() my_modal_title: string = "";
  @Input() my_modal_content: string = "";
  @Input() firstButtonLabel: string = "";
  @Input() secondButtonLabel: string = "";
  @Input() modalType: string = "";
  @Output() successAction = new EventEmitter();
  @Output() cancelAction = new EventEmitter();

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {

  }

  successActionFunc() {
    this.successAction.emit("first");
    this.activeModal.close("OK");
  }

  cancelActionFunc() {
    this.cancelAction.emit("second");
    this.activeModal.close("Cancel");
  }

}

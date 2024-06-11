import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.scss']
})
export class OBPPModalDialogComponent {

  @Input() my_modal_title: string = "";
  @Input() my_modal_content: string = "";
  @Input() my_model_additional_content: string = "";
  @Input() firstButtonLabel: string = "";
  @Input() secondButtonLabel: string = "";
  @Input() modalType: string = "";
  @Output() successAction = new EventEmitter();
  @Output() cancelAction = new EventEmitter();

  constructor(public activeModal: NgbActiveModal) {}

  successActionFunc() {
    this.successAction.emit("first");
    this.activeModal.close("OK");
  }

  cancelActionFunc() {
    this.cancelAction.emit("second");
    this.activeModal.close("Cancel");
  }

}
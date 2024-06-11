import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'modal-forgot-password',
  templateUrl: './modal-forgot-password.component.html',
  styleUrls: ['./modal-forgot-password.component.scss'],
})
export class OBPPModalForgotPasswordComponent implements OnInit{
  @Input() my_modal_title: string = '';
  @Input() my_modal_content: string = '';
  @Input() firstButtonLabel: string = '';
  @Input() secondButtonLabel: string = '';
  @Input() modalType: string = '';
  @Output() successAction = new EventEmitter();
  @Output() cancelAction = new EventEmitter();
  userEmailID: string = '';
  forgotForm!: FormGroup;

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder) {
    this.forgotForm = this.fb.group({
      useremail_forgot: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,7}$'),
        ],
      ],
    });
  }
  
  ngOnInit() {
    document.getElementById('email')?.focus()
  }

  successActionFunc() {
    if (this.forgotForm.valid && this.forgotForm.dirty) {
      this.successAction.emit(this.forgotForm.get('useremail_forgot')?.value);
      this.activeModal.close('OK');
    }
  }

  cancelActionFunc() {
    this.userEmailID = '';
    this.cancelAction.emit('');
    this.activeModal.close('Cancel');
  }
}

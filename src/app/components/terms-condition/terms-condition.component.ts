import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalTermsConditionComponent } from '../../common/shared/pop-up-modal/modal-terms-condition/modal-terms-condition.component';
import { TermsConditionService } from 'src/app/services/terms-conditions/terms-condition.service';

@Component({
  selector: 'app-terms-condition',
  templateUrl: './terms-condition.component.html',
  styleUrls: ['./terms-condition.component.scss'],
})
export class TermsConditionComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private modalService: NgbModal
  ) // private termsConditionService: TermsConditionService
  {}

  openDialog(
    title: string,
    body: string,
    firstButton: any,
    secondButton: any,
    type: string
  ) {
    const modalRef = this.modalService.open(ModalTermsConditionComponent);
    modalRef.componentInstance.my_modal_title = title;
    modalRef.componentInstance.my_modal_content = body;
    modalRef.componentInstance.firstButtonLabel = firstButton;
    modalRef.componentInstance.secondButtonLabel = secondButton;
    modalRef.componentInstance.modalType = type;
  }

  acceptTermsCondition() {
    let userName = '';
    this.route.queryParams.subscribe((params) => {
      userName = params['userName'];
    });

    // this.termsConditionService
    //   .submitAcceptTermsCondition(userName)
    //   .subscribe((res) => {
    //     this.openDialog("", "SUCCESS_TERMS_CONDITIONS_MESSAGE", "Close", null, "success");
    //   });
  }

  printTermsCondition() {
    let objFrame = document.getElementById('pdf-iframe') as HTMLIFrameElement;
    objFrame?.contentWindow?.focus();
    objFrame?.contentWindow?.print();
  }

  ngOnInit(): void {}
}

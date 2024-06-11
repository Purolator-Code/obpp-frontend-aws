import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DataSharingService } from 'src/app/services/login-page/data-sharing.service';
import { SharedService } from 'src/app/services/login-page/shared-service';

@Component({
  selector: 'obpp-footer',
  templateUrl: './obpp-footer.component.html',
  styleUrls: ['./obpp-footer.component.scss']
})
export class OBPPFooterComponent implements OnInit {

  year = new Date().getFullYear().toString();
  @Input() langLabel: string = "";
  @Output() langClick = new EventEmitter();

  constructor(public translate: TranslateService,private sharedService:SharedService) { }

  ngOnInit() {

  }

  languageSwitch(event: any) {
    this.langLabel = event;
    this.langClick.emit(event);
    this.sharedService.notifyLocalStorageChange();
    
  }
}
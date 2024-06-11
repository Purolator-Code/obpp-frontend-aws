import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-model-email-notification',
  templateUrl: './model-email-notification.component.html',
  styleUrls: ['./model-email-notification.component.css']
})
export class ModelEmailNotificationComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  public ok(){
    window.location.reload();
  }

}

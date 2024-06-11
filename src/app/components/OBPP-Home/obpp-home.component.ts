import { Component } from '@angular/core';

@Component({
  selector: 'obpp-home',
  templateUrl: './obpp-home.component.html',
  styleUrls: ['./obpp-home.component.scss'],
})
export class HomeComponent {
  content?: string;

  fieldErrorsObj = [];

  updateErrorMessage(event: any) {
    this.fieldErrorsObj = event;
  }
}

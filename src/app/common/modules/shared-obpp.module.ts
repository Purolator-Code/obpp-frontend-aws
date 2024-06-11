import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { NgbdSortableHeader } from '../bootstrap-sortable-header/sortable-header.directive';
import { TwoDigitDecimaNumberDirective } from 'src/app/common/shared/directives/two-digit-decimal.directive';

@NgModule({
  declarations: [NgbdSortableHeader, TwoDigitDecimaNumberDirective],
  exports: [NgbdSortableHeader, TwoDigitDecimaNumberDirective]
})
export class SharedOBPPModule {}
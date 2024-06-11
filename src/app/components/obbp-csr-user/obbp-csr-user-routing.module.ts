import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OBPPCsrHomeComponent } from './obpp-csr-home.component';
import { ObppLooseBillsComponent } from './obpp-loose-bills/obpp-loose-bills.component';
import { ObppNotificationLogComponent } from './obpp-notification-log/obpp-notification-log.component';
import { OBPPAdminQuickPayment } from './obpp-quick-pay/obpp-admin-quick-payment.component';
import { ObppTransactionLogComponent } from './obpp-transaction-log/obpp-transaction-log.component';

const routes: Routes = [
  {
    path: '',
    component: OBPPCsrHomeComponent,
    children: [
      {
        path: 'csr',
        component: OBPPCsrHomeComponent,
      },
      {
        path: 'transaction',
        component: ObppTransactionLogComponent,
      },
      {
        path: 'notification',
        component: ObppNotificationLogComponent,
      },
      {
        path: 'loosebills',
        component: ObppLooseBillsComponent,
      },

      {
        path: 'viewCustomerScreen',

        loadChildren: () =>
          import(
            './obpp-view-customer-screens/obpp-view-customer-screen.module'
          ).then((m) => m.ObbpCsrViewCustomerScreenModule),
      },
      {
        path: 'quickpay',
        component: OBPPAdminQuickPayment,
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ObbpCsrUserRoutingModule {}

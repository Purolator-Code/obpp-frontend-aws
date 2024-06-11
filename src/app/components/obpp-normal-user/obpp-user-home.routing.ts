import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OBPPUserHomeComponent } from './obpp-user-home.component';
import { OBPPUserAutoPayComponent } from './obpp-auto-pay/obpp-auto-pay.component';
import { OBPPUserAccountSummaryComponent } from './obpp-account-summary/obpp-account-summary.component';
import { OBPPUserAccountDisputeComponent } from './obpp-account-dispute/obpp-account-dispute.component';
import { OBPPUserProfileComponent } from './obpp-user-profile/obpp-user-profile.component';
import { OBPPUserManageAccountsComponent } from './obpp-manage-accounts/obpp-manage-accounts.component';


const routes: Routes = [
    {
        path: '',
        component: OBPPUserHomeComponent,
        children: [
            {
                path: 'user',
                component: OBPPUserHomeComponent,
            },
            {
                path: 'autopay',
                component: OBPPUserAutoPayComponent,
            },
            {
                path: 'account-summary',
                component: OBPPUserAccountSummaryComponent
            },
            {
                path: 'account-dispute',
                component: OBPPUserAccountDisputeComponent
            },
            {
                path: 'manage-accounts',
                component: OBPPUserManageAccountsComponent
            },
            {
                path: 'user-profile',
                component: OBPPUserProfileComponent
            }
        ]
    }
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OBPPUserHomeRoutingModule { }
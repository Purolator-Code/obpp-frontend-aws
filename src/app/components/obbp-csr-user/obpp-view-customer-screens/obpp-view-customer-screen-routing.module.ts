import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OBPPUserHomeComponent } from '../../obpp-normal-user/obpp-user-home.component';
import { OBPPUserAutoPayComponent } from '../../obpp-normal-user/obpp-auto-pay/obpp-auto-pay.component';
import { OBPPUserAccountSummaryComponent } from '../../obpp-normal-user/obpp-account-summary/obpp-account-summary.component';
import { OBPPUserAccountDisputeComponent } from '../../obpp-normal-user/obpp-account-dispute/obpp-account-dispute.component';
import { OBPPUserProfileComponent } from '../../obpp-normal-user/obpp-user-profile/obpp-user-profile.component';
import { OBPPUserManageAccountsComponent } from '../../obpp-normal-user/obpp-manage-accounts/obpp-manage-accounts.component';
import { viewCustomerScreenComponent } from './obpp-view-customer-screen.component';



const routes: Routes = [

   {
     
        path: '',component: viewCustomerScreenComponent,
      
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
export class OBPPViewUserHomScreenRoutingModule { }
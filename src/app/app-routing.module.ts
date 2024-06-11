import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OBPPError404Component } from './components/error-component/error-404/error-404.component';
import { ObppEnrollAutopayComponent } from './components/OBPP-Home/obpp-enroll-autopay/obpp-enroll-autopay.component';
import { HomeComponent } from './components/OBPP-Home/obpp-home.component';
import { OBPPUserRegisterComponent } from './components/OBPP-Home/obpp-user-register/obpp-user-register.component';
import { OBPPQuickPayment } from './components/OBPP-Home/obpp-quick-pay/obpp-quick-payment.component';
import { ObppManageUsersComponent } from './components/obpp-administrator/obpp-manage-users/obpp-manage-users.component';
import { AuthGuard } from './common/http-interceptors/auth-guard.service';
import { AdminAuthGuard } from './common/http-interceptors/admin-auth-guard.service';
import { OBPPActiveUser } from './components/OBPP-Home/obpp-active-user/obpp-active-user.component';
import {TermsConditionComponent} from './components/terms-condition/terms-condition.component'

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent},
    {
      path: 'register',
      component: OBPPUserRegisterComponent
    },
    {
      path: 'setPassword',
      component: OBPPActiveUser
    },
    {
      path: 'enrollAutoPay',
      component: ObppEnrollAutopayComponent
    },
    {
      path: 'quickpay',
      component: OBPPQuickPayment
    },
    {
      path: 'manageusers',
      component: ObppManageUsersComponent,
      canActivate: [AdminAuthGuard]
    },
    {
      path:'user',
      loadChildren: () => import('./components/obpp-normal-user/obpp-user-home.module').then(m => m.OBPPUserHomeModule),
      canActivate: [AuthGuard]
    },
    {
      path:'csr',
      loadChildren: () => import('./components/obbp-csr-user/obbp-csr-user.module').then(m => m.ObbpCsrUserModule),
      canActivate: [AdminAuthGuard]
    },
    { path: 'lfr', redirectTo: '/', pathMatch: 'full' },
    { path: 'error', component: OBPPError404Component },
    {path: 'acceptTermsAndConditions/len',component: TermsConditionComponent },
    { path: '**', redirectTo: '/error' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes) ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
import { UserComponent } from './user/user.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from './guard/authentication.guard';
import { BankStatementTableDisplayComponent } from './bank-statement-table-display/bank-statement-table-display.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'user/management',
    component: UserComponent,
    canActivate: [AuthenticationGuard],
  },
  {
    path: 'bankStatement/Display',
    component: BankStatementTableDisplayComponent,
    //canActivate: [AuthenticationGuard],
  },
  { path: '**', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

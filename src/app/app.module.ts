import { MaterialModule } from './material-module';
import { UserService } from './service/user.service';
import { AuthenticationService } from './service/authentication.service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './interceptor/auth.interceptor';
import { AuthenticationGuard } from './guard/authentication.guard';
import { NotificationModule } from './notification.module';
import { NotificationService } from './service/notification.service';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserComponent } from './user/user.component';
import { FormsModule } from '@angular/forms';
import { BankStatementTableDisplayComponent } from './bank-statement-table-display/bank-statement-table-display.component';
import { MSAL_INSTANCE, MsalModule, MsalService } from '@azure/msal-angular';
import {
  IPublicClientApplication,
  PublicClientApplication,
} from '@azure/msal-browser';

import 'tslib';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BankStatementTableComponent } from './bank-statement-table/bank-statement-table.component';
import { DatePipe } from '@angular/common';
export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: '9f262043-86aa-49b6-ae83-590b7e702f08',
      redirectUri: 'http://localhost:4200/register',
    },
  });
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    UserComponent,
    BankStatementTableDisplayComponent,
    BankStatementTableComponent,
  ],
  imports: [
    NotificationModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MsalModule,
    BrowserAnimationsModule,
    MaterialModule,
    MatIconModule,
  ],
  providers: [
    DatePipe,
    NotificationService,
    AuthenticationGuard,
    AuthenticationService,
    UserService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    MsalService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

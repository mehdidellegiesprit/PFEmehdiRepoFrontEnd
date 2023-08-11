import { MaterialModule } from './material-module';
import { UserService } from './service/user.service';
import { AuthenticationService } from './service/authentication.service';
import { LOCALE_ID, NgModule } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { FullCalendarModule } from '@fullcalendar/angular';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ModalFactureComponent } from './modal-facture/modal-facture.component';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AngularFireModule } from '@angular/fire';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { environment } from './environments/environments';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { ReplacePipe } from './pipe/replace.pipe';

import localeFr from '@angular/common/locales/fr';
import { registerLocaleData } from '@angular/common';
import { BankStatementUploadComponent } from './bank-statement-upload/bank-statement-upload.component';
import { SplitPipe } from './pipe/split.pipe';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { FilterDialogComponent } from './filter-dialog/filter-dialog.component';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Ng5SliderModule } from 'ng5-slider';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MonthSelectorDialogComponent } from './month-selector-dialog/month-selector-dialog.component';
import { MonthExporterFacturesComponent } from './month-exporter-factures/month-exporter-factures.component';

registerLocaleData(localeFr, 'fr-FR');

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
    ModalFactureComponent,
    BankStatementUploadComponent,
    ReplacePipe,
    SplitPipe,
    ConfirmationDialogComponent,
    FilterDialogComponent,
    MonthSelectorDialogComponent,
    MonthExporterFacturesComponent,
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
    MatSelectModule,
    MatChipsModule,
    FullCalendarModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCheckboxModule,
    AngularFireStorageModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    MatSliderModule,
    MatDatepickerModule,
    MatNativeDateModule,
    Ng5SliderModule,
    DragDropModule,
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
    MatDialog,
    { provide: LOCALE_ID, useValue: 'fr-FR' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

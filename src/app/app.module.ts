import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AddressViewerComponent } from './addresses/address-viewer/address-viewer.component';
import { AddressGridComponent } from './addresses/address-grid/address-grid.component';
import { HeaderComponent } from './shared/components/header/header.component';
import {AddressService} from './shared/services/address.service';
import { AppRoutingModule } from './app-routing.module';
import {HttpClientModule} from '@angular/common/http';
import {WorkerHandler} from './shared/worker/worker-handler';
import { LoadComponent } from './load/load.component';
import {TableModule} from 'primeng/table';
import {ProgressBarModule} from 'primeng/progressbar';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {MessageService} from 'primeng/api';
import {ToastModule} from 'primeng/toast';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';

@NgModule({
  declarations: [
    AppComponent,
    AddressViewerComponent,
    AddressGridComponent,
    HeaderComponent,
    LoadComponent
  ],
    imports: [
      BrowserModule,
      BrowserAnimationsModule,
      NoopAnimationsModule,
      AppRoutingModule,
      HttpClientModule,
      FormsModule,
      TableModule,
      ProgressBarModule,
      ToastModule,
      ButtonModule,
      InputTextModule
    ],
  providers: [
    MessageService,
    AddressService,
    WorkerHandler
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

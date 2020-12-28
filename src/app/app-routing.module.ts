import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AddressViewerComponent} from './addresses/address-viewer/address-viewer.component';
import {LoadComponent} from './load/load.component';
import {WorkerGuard} from './shared/guards/worker.guard';

const routes: Routes = [
  { path: 'directory',
    component: AddressViewerComponent,
    canActivate: [WorkerGuard]},
  { path: 'load', component: LoadComponent },
  { path: '', pathMatch: 'full', redirectTo: 'directory' }

];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

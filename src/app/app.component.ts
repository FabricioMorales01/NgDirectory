import { Component } from '@angular/core';
import {AddressService} from './shared/services/address.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ng-directory';

  constructor(private readonly addressService: AddressService) {
    this.addressService.loadLibs();
  }
}

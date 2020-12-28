import { Component, OnInit } from '@angular/core';
import {AddressService} from '../shared/services/address.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-load',
  templateUrl: './load.component.html',
  styleUrls: ['./load.component.scss']
})
export class LoadComponent implements OnInit {

  constructor(private readonly addressService: AddressService,
              private router: Router) { }

  ngOnInit(): void {
    this.initTimeout();
  }

  /* Aallows query to data status and redirect to directory when it is ready
  * @param address: address to edit
  * @param index: index in current addresses list
  */
  private initTimeout(): void {
    setTimeout(() => {

      if (this.addressService.isLoadedLibs()) {
        this.router.navigate(['']);
      } else {
        this.initTimeout();
      }
    }, 1000);
  }
}

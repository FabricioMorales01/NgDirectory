import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {AddressGridComponent} from '../address-grid/address-grid.component';

@Component({
  selector: 'app-address-viewer',
  templateUrl: './address-viewer.component.html',
  styleUrls: ['./address-viewer.component.scss']
})
export class AddressViewerComponent implements OnInit {

  @ViewChild(AddressGridComponent) addressGrid: AddressGridComponent | undefined;

  constructor() { }

  ngOnInit(): void {
  }

}

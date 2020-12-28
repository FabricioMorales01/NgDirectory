import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadComponent } from './load.component';
import {AddressService} from '../shared/services/address.service';
import createSpyObj = jasmine.createSpyObj;
import {RouterTestingModule} from '@angular/router/testing';

describe('LoadComponent', () => {
  let component: LoadComponent;
  let fixture: ComponentFixture<LoadComponent>;

  beforeEach(async () => {
    const addressServiceSpy = createSpyObj(['isLoadedLibs']);
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ LoadComponent ],
      providers: [
        {provide: AddressService, useValue: addressServiceSpy}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

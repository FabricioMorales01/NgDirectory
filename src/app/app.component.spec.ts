import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import {AddressService} from './shared/services/address.service';
import createSpyObj = jasmine.createSpyObj;

describe('AppComponent', () => {
  beforeEach(async () => {
    const addressServiceSpy: any = createSpyObj(['loadLibs']);

    await TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      providers: [
        {provide: AddressService, useValue: addressServiceSpy}
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});

import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import {AddressService} from '../services/address.service';

@Injectable({
  providedIn: 'root'
})
export class WorkerGuard implements CanActivate, CanActivateChild {

  constructor(private readonly addressService: AddressService,
              private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkLoadedLibs();
  }
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkLoadedLibs();
  }

  /* Check if data is loaded and redirect to load view if it is necessary
  * @return true if data is loaded
  */
  private checkLoadedLibs( ): boolean {
    const isLoaded = this.addressService.isLoadedLibs();

    if (!isLoaded) {
      this.router.navigate(['/load', {}]);
    }

    return isLoaded;
  }
}

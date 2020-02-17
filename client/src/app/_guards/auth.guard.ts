import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { SessionService } from '../_service/session.service';

@Injectable()
export class AuthGuard implements CanActivate {
    
    constructor(
        private sessionService: SessionService,
        private router: Router
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const redirectURL = route['_routerState']['url'];

        if(this.sessionService.isLoggedIn()) {
            return true;
        } else {
            this.router.navigateByUrl('/');
        }

        this.router.navigateByUrl(
            this.router.createUrlTree(
                ['/login'], {
                    queryParams: {
                        redirectURL
                    }
                }
            )
        )
    }
}
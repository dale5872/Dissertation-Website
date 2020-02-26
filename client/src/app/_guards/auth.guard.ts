import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { SessionService } from '../_service/session.service';

@Injectable()
export class AuthGuard implements CanActivate {
    
    constructor(
        private sessionService: SessionService,
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if(this.sessionService.isLoggedIn()) {
            return true;
        }

        this.sessionService.redirectUnauthenticatedUser();        
    }
}
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { SessionService } from '../_service/session.service';
import { HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor {
    constructor(
        private session: SessionService
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if(this.session.isLoggedIn()) {
            const cloned = req.clone({
                headers: req.headers.set("Authorization", localStorage.getItem("JWT"))
            });

            return next.handle(cloned);
        }

        return next.handle(req);
    }
}
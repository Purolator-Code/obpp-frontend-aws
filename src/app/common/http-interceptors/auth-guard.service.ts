import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { OBPPLoginService } from "src/app/services/login-page/login-page.service";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(
        private router: Router,
        private authservice: OBPPLoginService) { }

    canActivate() {
        if (this.authservice.getAuthToken()) return true;
        window.location.href = "/home";
        return false;
    }
} 
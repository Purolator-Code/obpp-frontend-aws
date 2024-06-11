import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { OBPPLoginService } from "src/app/services/login-page/login-page.service";

@Injectable({
    providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate {

    constructor(
        private router: Router,
        private authservice: OBPPLoginService) { }

    canActivate() {
        let role = this.authservice.getUserDetails()?.serviceResponse?.roleDto;
        role = role ? role['roleName'] : "";
        if (this.authservice.getAuthToken() && role && (role === "Administrator" || role==="CSR" || role=="CSR Supervisor")) return true;
        window.location.href = "/home";
        return false;
    }
    
} 
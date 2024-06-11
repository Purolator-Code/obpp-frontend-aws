import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
    selector: 'error-404',
    templateUrl: './error-404.component.html',
    styleUrls: ['./error-404.component.scss']
  })
  export class OBPPError404Component implements OnInit {


    ngOnInit(): void {
        
    }

    constructor(private router: Router) {

    }

    redirectToHome() {
      this.router.navigateByUrl("/home");
    }

  }
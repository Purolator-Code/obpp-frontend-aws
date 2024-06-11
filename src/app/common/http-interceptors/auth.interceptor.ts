import { HTTP_INTERCEPTORS, HttpEvent, HttpXsrfTokenExtractor } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { OBPPLoginService } from '../../services/login-page/login-page.service';

// const TOKEN_HEADER_KEY = 'Authorization';       // for Spring Boot back-end
const TOKEN_HEADER_KEY = 'x-access-token';   // for Node.js Express back-end

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    public router: Router,
    private tokenExtractor: HttpXsrfTokenExtractor,
    private obppLoginService: OBPPLoginService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req;

    let t = "" + new Date().getTime();
    let csrfToken = this.obppLoginService.getAuthToken();
    const cookieheaderName = 'X-Csrf-Token';
    if (csrfToken) {
      authReq = req.clone(
        {
          headers: req.headers.set(cookieheaderName, csrfToken)
            .set('Content-Type', 'application/json')
            .set('Accept', '*/*')
            .set('t', t)
            .set('ts', t)

        });
    } else {
      authReq = req.clone(
        {
          headers: req.headers.set('Content-Type', 'application/json')
            .set('Accept', '*/*')
            .set('t', t)
            .set('ts', t)
        });
    }


    return next.handle(authReq).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          const newCsrfToken = event.headers.get(cookieheaderName);
          if (newCsrfToken) {
            this.obppLoginService.setAuthToken(newCsrfToken);
          }
        }
      }),
      retry(1),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
          // client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // server-side error
          switch (error.status) {
            case 401:      //login
              this.router.navigateByUrl("/home");
              break;
            case 403:     //forbidden
              this.router.navigateByUrl("/error");
              break;
          }

          errorMessage = `Error Status: ${error.status}\nMessage: ${error.message}`;
        }
        return throwError(errorMessage);
      })
    );
  }
}

export const authInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
];

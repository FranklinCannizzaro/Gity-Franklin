import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { DataService } from './data.service';

@Injectable()
export class AppInterceptor implements HttpInterceptor {

  stringArray: string[] = ['/user/login', '/user/exist/', '/user/create-user/doctor','user/forgotPasswordID','/user/resetPassword'];

  constructor(private dataService: DataService){}

  intercept(httpRequest: HttpRequest<any>, httpHandler: HttpHandler): Observable<HttpEvent<any>> {
    var clonedRequest = httpRequest.clone({ 
      headers: httpRequest.headers.append('Authorization', 'Basic ' + this.dataService.token())
    });
    
    if(this.stringArray.some(item => httpRequest.url.includes(item))){
        clonedRequest = httpRequest;
    }

    return httpHandler.handle(clonedRequest);
  }
}

import { Injectable } from '@angular/core';
import { EMPTY, Observable } from "rxjs";
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders ,HttpEvent, HttpRequest} from '@angular/common/http';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from '../components/dialogs/message-dialog/message-dialog.component';
import { OrderDetailsNew } from '../components/create-task-demo/create-task-demo.component';

@Injectable({
    providedIn: 'root',
})

export class DataService {
    baseUrl: string = environment.apiUrl;


    postFileWithProgress(url: string, file: File): Observable<HttpEvent<any>> {
        const form = new FormData();
  form.append('file', file);

  
  return this.httpClient.post(this.baseUrl + url, form, {
    reportProgress: true,
    observe: 'events',    
       
        });
    
       
      }

    progressBarActive: boolean = false;
    progressBarActiveForSlider: boolean = false;
    pageTitle: string = '';
    
    displayImageBytes: string = '';
    isActive: boolean = false;
    isAvailable: boolean = false;
    isOauthUser: boolean = false;
    role: string = '';
    userId: string = '';
    initials: string = '';
    cartCount: number = 0;
    emailId: string = '';
    firstName: string = '';
    lastName: string = '';

    constructor(private httpClient: HttpClient, private location: Location, private dialog: MatDialog) {}

    updateCartCount(){
        this.get('/tasks/pending-payment').subscribe({
          next: (response: any[]) => {
            this.cartCount = response.length;
          },
          error: (err) => {
            this.handleError(err, 'Failed to get Sub Types information, Please try again.').subscribe(result => this.location.back());
          }
        });
    }

    refreshState(){
        if(!this.userId){
            this.role = sessionStorage.getItem('role') ?? '';
            this.emailId = sessionStorage.getItem('emailId') ?? '';
            this.firstName = sessionStorage.getItem('firstName') ?? '';
            this.lastName = sessionStorage.getItem('lastName') ?? '';
            this.userId = sessionStorage.getItem('userId') ?? '';
            this.initials = sessionStorage.getItem('initials') ?? '';
            this.isOauthUser = sessionStorage.getItem('isOauthUser') === 'true';
            this.isActive = sessionStorage.getItem('isActive') === 'true';
            this.isAvailable = sessionStorage.getItem('isAvailable') === 'true';
            this.displayImageBytes = sessionStorage.getItem('displayImageBytes') ?? '';
        }
        return this.userId.length > 0;
    }

    isLoggedIn(){
        this.role = sessionStorage.getItem('role') ?? '';
        this.userId = sessionStorage.getItem('userId') ?? '';
        this.emailId = sessionStorage.getItem('emailId') ?? '';
        this.firstName = sessionStorage.getItem('firstName') ?? '';
        this.lastName = sessionStorage.getItem('lastName') ?? '';
        this.initials = sessionStorage.getItem('initials') ?? '';
        this.isActive = sessionStorage.getItem('isActive') === 'true';
        this.isAvailable = sessionStorage.getItem('isAvailable') === 'true';
        this.isOauthUser = sessionStorage.getItem('isOauthUser') === 'true';
        this.displayImageBytes = sessionStorage.getItem('displayImageBytes') ?? '';
        return this.token().length > 0;
    }

    updateTitle(title: string) {
        setTimeout(() => this.pageTitle = title, 0);
    }

    updateProgressBarSubject(progressBarActive: boolean) {
        setTimeout(() => this.progressBarActive = progressBarActive, 0);
    }

    updateProgressBarSubjectForSlider(progressBarActiveForSlider: boolean) {
        setTimeout(() => this.progressBarActiveForSlider = progressBarActiveForSlider, 0);
    }

    saveUserDetails(response: any) {
        sessionStorage.setItem('token', btoa(response.userId+':'+response.token));
        sessionStorage.setItem('role', response.role.replace('ROLE_', ''));
        sessionStorage.setItem('emailId', response.emailId);
        sessionStorage.setItem('firstName', response.firstName);
        sessionStorage.setItem('lastName', response.lastName);
        sessionStorage.setItem('userId', response.userId);
        sessionStorage.setItem('isOauthUser', response.isOauthUser);
        sessionStorage.setItem('isActive', response.isActive);
        sessionStorage.setItem('isAvailable', response.isAvailable);
        sessionStorage.setItem('displayImageBytes', response.displayImageBytes ? response.displayImageBytes : '');
        if(response.firstName && response.lastName){
            sessionStorage.setItem('initials', response.firstName[0].toUpperCase() + response.lastName[0].toUpperCase());
        }else{
            sessionStorage.setItem('initials', response.userId[0].toUpperCase());
        }
        this.refreshState();
    }

    token() {
        return sessionStorage.getItem('token') ?? '';
    }

    clearUserDetails() {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('initials');
        this.refreshState();
    }

    getDataAsList(path: string): Observable<any[]> {
        return this.httpClient.get<any[]>(environment.apiUrl + path);
    }

    get(path: string, options?: any): Observable<any> {
        var optionsToSend = options ? options : {};
        return this.httpClient.get<any>(environment.apiUrl + path, optionsToSend);
    }
    
    getStaticFile<T>(path: string): Observable<T> {
        return this.httpClient.get<T>(path);
    }

    post(path: string, content: any): Observable<any> {
        return this.httpClient.post<any>(environment.apiUrl + path, content);
    }

    put(path: string, content: any): Observable<any> {
        return this.httpClient.put<any>(environment.apiUrl + path, content);
    }

    delete(path: string): Observable<any> {
        return this.httpClient.delete<any>(environment.apiUrl + path);
    }

    postFile(path: string, file: File, body?: any): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        if (body) {
            Object.keys(body).forEach(key => {
                formData.append(key, body[key]);
            });
        }
        return this.httpClient.post(environment.apiUrl + path, formData, {
            headers: new HttpHeaders({ 'X-Digital-FileName': file.name.replace(/[^a-zA-Z0-9.]/g, '_') })
        });
    }

    postMultiPartData(path: string, formData: FormData, headers?: HttpHeaders): Observable<any> {
        const options = headers ? { headers } : {};
        return this.httpClient.post(environment.apiUrl + path, formData, options);
    }

    combineToothNumbers(input: number[]): string {
        if (input.length === 0) return '';
    
        const sorted = input.sort((a, b) => a - b);
        const ranges: string[] = [];
        let start = sorted[0];
      
        for (let i = 1; i <= sorted.length; i++) {
          if (i === sorted.length || sorted[i] !== sorted[i - 1] + 1) {
            const end = sorted[i - 1];
            ranges.push(start === end ? `${start}` : `${start} - ${end}`);
            start = sorted[i];
          }
        }
      
        return ranges.join(', ');
      }
      
    invertToothNumbers(input: string): number[] {
        const result: number[] = [];
        const ranges = input.split(',').map(range => range.trim());

        ranges.forEach(range => {
            const [start, end] = range.split('-').map(Number);
            if (end !== undefined) {
                for (let i = start; i <= end; i++) {
                    result.push(i);
                }
            } else {
                result.push(start);
            }
        });

        return result;
    }

    handleError(error: any, errorMessage: string): Observable<any> {
        if (error.status === 401) {
            this.clearUserDetails();
            this.openMessageDialog('Error', 'Session expired, please login again.').subscribe(() => window.location.href = '#/login');
            return EMPTY;
        }else{
            return this.openMessageDialog('Error', errorMessage);
        }
    }

    openMessageDialog(header: string, body: string): Observable<any> {
        this.updateProgressBarSubject(false);
        const dialogRef = this.dialog.open(MessageDialogComponent, {
            data: { header: header, content: body }
        });
        return dialogRef.afterClosed();
    }

    openMessageDialogWithSize(header: string, body: string, width: string, height: string) {
        this.updateProgressBarSubject(false);
        const dialogRef = this.dialog.open(MessageDialogComponent, {
            width: width, height: height,
            data: { header: header, content: body }
        });
        return dialogRef.afterClosed();
    }

    checkTwoSetIntersect(array1: number[], array2: number[]): boolean {
        return array1.some(tooth => array2.includes(tooth));
    }

    anteriorTeeth: number[] = [
        13, 12, 11, 21, 22, 23,
        43, 42, 41, 31, 32, 33
    ];

    anteriorTeeth_1: number[] = [
                13, 12, 11, 21, 22, 23,
        45, 44, 43, 42, 41, 31, 32, 33, 34, 35
    ];

    isAnteriorTeeth(teeth: number[]): boolean {
        return teeth.every(tooth => this.anteriorTeeth.includes(tooth));
    }

    groupByAnteriorAndPosterior_1(teeth: number[]): { anterior: number[], posterior: number[] } {
        const anterior: number[] = [];
        const posterior: number[] = [];
        teeth.forEach(tooth => {
            if (this.anteriorTeeth_1.includes(tooth)) {
                anterior.push(tooth);
            } else {
                posterior.push(tooth);
            }
        });
        return { anterior, posterior };
    }

    groupByAnteriorAndPosterior(teeth: number[]): { anterior: number[], posterior: number[] } {
        const anterior: number[] = [];
        const posterior: number[] = [];
        teeth.forEach(tooth => {
            if (this.anteriorTeeth.includes(tooth)) {
                anterior.push(tooth);
            } else {
                posterior.push(tooth);
            }
        });
        return { anterior, posterior };
    }

    teethOrder: number[] = [
        18, 17, 16, 15, 14,   13, 12, 11, 21, 22, 23,   24, 25, 26, 27, 28,
        48, 47, 46, 45, 44,   43, 42, 41, 31, 32, 33,   34, 35, 36, 37, 38
    ];

    rearrangedTeethOrder(teeth: number[]): string {
        return this.teethOrder.filter(tooth => teeth.includes(tooth)).join(', ');
    }

    rearrangedTeethOrderByOrderDetails(orderDetailsNew: OrderDetailsNew){
        var teeth: number[] = orderDetailsNew.toothData.map(tooth => tooth.teeth).flat();
        return this.teethOrder.filter(tooth => teeth.includes(tooth)).join(', ');
    }

    getDataAsText(url: string): Observable<string> {
        return this.httpClient.get<string>(environment.apiUrl + url, {
          responseType: 'text' as 'json'
        });
      }
      
      
      

}
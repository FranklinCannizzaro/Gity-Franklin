import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogService } from '../../Services/dialog.service';
import { DataService } from '../../Services/data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SignUpComponent } from '../sign-up/sign-up.component';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ResetPasswordComponent } from '../resetPassword/reset-password.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  private apiUrl = environment.apiUrl;

  displayLogin: boolean = false;
  dashBoardDataComplete: any;
  dashBoardDataInComplete: any;
  inCompleteCount: number = 0; // Initialize with a default value
  inprogressCount: number = 0; 

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private http: HttpClient, private dialogService: DialogService, public dataService: DataService, private router: Router, private dialog: MatDialog) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }

  reset(){
    this.router.navigate(['/reset']);
  }

  getInProgressTasks() {
    this.dataService.getDataAsList('/tasks/in-progress').subscribe({
      next: (response) => {
        this.dashBoardDataInComplete = response.length;
        this.inprogressCount = this.dashBoardDataInComplete; 
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get In Progress Tasks, Please try again.');
      }
    });
  }

  getCompletedTasks() {
    this.dataService.getDataAsList('/tasks/complete').subscribe({
      next: (response) => {
        this.dashBoardDataComplete = response.length;
        this.inCompleteCount = this.dashBoardDataInComplete;
        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get In Progress Tasks, Please try again.');
      }
    });
  }

  fetchTasksAndRoute() {
    if(this.dataService.role == 'doctor'){
      this.router.navigate(['/create-task-demo']);
    }else{
      this.router.navigate(['/dashboard']);
    }
    

    // const completedTasks$ = this.dataService.getDataAsList('/tasks/complete');
    // const inProgressTasks$ = this.dataService.getDataAsList('/tasks/in-progress');

    // completedTasks$.subscribe({
    //   next: (response) => {
    //     this.dashBoardDataComplete = response.length;
    //     this.inCompleteCount = this.dashBoardDataInComplete;
    //     this.dataService.updateProgressBarSubject(false);

    //     inProgressTasks$.subscribe({
    //       next: (response) => {
    //         this.dashBoardDataInComplete = response.length;
    //         this.inprogressCount = this.dashBoardDataInComplete;
    //         this.routeToPageAsPertask();
    //       },
    //       error: (err) => {
    //         this.dialogService.handleError(err, 'Failed to get In Progress Tasks, Please try again.');
    //       }
    //     });
    //   },
    //   error: (err) => {
    //     this.dialogService.handleError(err, 'Failed to get Completed Tasks, Please try again.');
    //   }
    // });
  }

  ngOnInit(): void {
    if (this.dataService.isLoggedIn()) {
      this.fetchTasksAndRoute();
    }

    this.route.queryParamMap.subscribe(params => {
      if (params.get('user') && sessionStorage.getItem('googleAuthCode')) {
        const { username, password } = this.loginForm.value;
        const headers = new HttpHeaders({ 'X-Digital-Auth': btoa(`${params.get('user')}:${sessionStorage.getItem('googleAuthCode')}`) });

        this.http.post<any>(`${this.apiUrl}/user/login`, null, { headers: headers }).subscribe({
          next: (response) => {
            sessionStorage.removeItem('googleAuthCode');
            this.dataService.saveUserDetails(response);
            this.dataService.updateProgressBarSubject(false);
            if (response.isActive) {
              this.fetchTasksAndRoute();
            } else {
              this.router.navigate(['/user-test']);
            }
          },
          error: (error) => {
            var errMsg = error.status == 401 ? 'Incorrect User Id or Password.' : 'Login Failed, please contact System Admin.';
            this.dialogService.openMessageDialog('Error', errMsg);
          }
        });
      } else {
        this.displayLogin = true;
      }
    });
  }

  loginWithGoogle() {
    const code = Math.random().toString(36).substring(2);
    sessionStorage.setItem('googleAuthCode', code);
    const state = btoa(`${window.location.href}||${code}||${this.apiUrl}`);
    window.location.href = `${this.apiUrl}/user/google?state=${state}`;
  }

  openSignupModal(event: MouseEvent) {
    event.preventDefault();
    this.dialog.open(SignUpComponent);
  }

  onSubmit() {
    this.dataService.updateProgressBarSubject(true);
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      const headers = new HttpHeaders({ 'X-Digital-Auth': btoa(`${username}:${password}`) });

      this.http.post<any>(`${this.apiUrl}/user/login`, null, { headers: headers }).subscribe({
        next: (response) => {
          this.dataService.saveUserDetails(response);
          this.dataService.updateProgressBarSubject(false);
          if (response.isActive) {
            this.fetchTasksAndRoute();
          } else {
            this.router.navigate(['/user-test']);
          }
        },
        error: (error) => {
          var errMsg = error.status == 401 ? 'Incorrect User Id or Password.' : 'Login Failed, please contact System Admin.';
          this.dialogService.openMessageDialog('Error', errMsg);
        }
      });
    } else {
      this.dialogService.openMessageDialog('Error', 'User Id or Password is missing.');
    }
  }

  routeToPageAsPertask() {

    if(this.dataService.role == 'designer' || this.dataService.role == 'admin'){
      this.router.navigate(['/dashboard']);
    }else if ((this.inCompleteCount > 0) || (this.inprogressCount > 0)) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/create-task-demo']);
    }
  }
}


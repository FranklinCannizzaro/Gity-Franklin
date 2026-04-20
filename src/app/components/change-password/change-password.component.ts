import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DataService } from '../../Services/data.service';
import Validation from '../sign-up/Validation';
import { DialogService } from '../../Services/dialog.service';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ResetPasswordComponent } from '../resetPassword/reset-password.component';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatInputModule } from '@angular/material/input';


@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
  animations: [
    trigger('dialogResize', [
      state('change', style({ width: '500px', height: '630px' })),
      state('reset', style({ width: '500px', height: '320px' })),
      state('new', style({ width: '500px', height: '600px' })),
      transition('change <=> reset', [
        animate('400ms cubic-bezier(0.4,0,0.2,1)')
      ]),
      transition('reset <=> new', [
        animate('400ms cubic-bezier(0.4,0,0.2,1)')
      ])
    ])
  ]
})
export class ChangePasswordComponent {

  changePasswordForm!: FormGroup;
  passwordChanged = false;
  errorMessage = '';
  submitted = false;
   showPasswordOnPress!: boolean;
   emailId: string = '';
  showPassword: { [key: string]: boolean } = {};
  constructor(private http: HttpClient, private dataService: DataService, private fb: FormBuilder, private dialogService: DialogService, private router: Router, private dialogRef: MatDialogRef<ChangePasswordComponent>, private dialog: MatDialog) {
  

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(40)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });



    this.resetForm = this.fb.group({
      generatedToken: ['', Validators.required],
      pwd: ['', [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(40),
        ],
      ],
      confirmPassword: ['', Validators.required]
      

    },
      {
        validators: [Validation.match('pwd', 'confirmPassword')],
      }
    );
  
  
  }

  ngOnInit() {
    
    this.emailId = this.dataService.emailId;
    this.changePasswordForm.valueChanges.subscribe(() => {
      this.passwordMatchValidator(this.changePasswordForm);
    });
    
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const newPassword = formGroup.get('newPassword');
    const confirmPassword = formGroup.get('confirmPassword');
  
    if (confirmPassword?.dirty || confirmPassword?.touched) {
      if (newPassword?.value !== confirmPassword?.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
      } else {
        confirmPassword.setErrors(null);
      }
    }
  }
  
  

  get f() {
    return this.changePasswordForm.controls;
  }

  onSubmit() {
    this.submitted = true;
  
    if (this.changePasswordForm.valid) {
      console.log('Password change request sent:', this.changePasswordForm.value);
      this.dataService.updateProgressBarSubject(true);
  
      this.dataService.post('/user/changePassword', this.changePasswordForm.value).subscribe({
        next: (response) => {
          if(response.userCount == 1){
            this.dialogService.openMessageDialog('Info', 'Password changed successfully.').subscribe(res => window.location.href = '#/dashboard');
            this.dataService.updateProgressBarSubject(false);
            this.passwordChanged = true;
            this.errorMessage = '';
            this.changePasswordForm.reset();
            this.submitted = false;
          }
          else{
            this.dialogService.openMessageDialog('Error', 'Current password does not match. Please try again.');
            // .subscribe(res => window.location.href = '#/dashboard');
          }
        },
        error: (err) => {
          this.dataService.updateProgressBarSubject(false);
          this.passwordChanged = false;
          this.errorMessage = 'Failed to change password. Please try again later.';         
        }
      });
    } else {
      this.errorMessage = 'Please correct the errors above.';
    }
  }

  togglePasswordVisibility(field: string): void {
    this.showPassword[field] = !this.showPassword[field];
  }

  cancel(){
    this.dialogRef.close();
  }


openResetPasswordModal() {
  const dialogContainer = document.querySelector('.mat-dialog-container');
  if (dialogContainer) {
    dialogContainer.classList.add('shrink-dialog');
    setTimeout(() => {
      this.dialogRef.close();
      setTimeout(() => {
        this.dialog.open(ResetPasswordComponent, {
          height: '50%',
          maxHeight: '50vh',
          width: '400px',
          disableClose: true,
          autoFocus: false,
          panelClass: 'custom-dialog-transition'
        });
      }, 200); // Wait for the dialog to close before opening the new one
    }, 200); // Wait for the shrink animation to finish
  } else {
    // Fallback: just close and open
    this.dialogRef.close();
    setTimeout(() => {
      this.dialog.open(ResetPasswordComponent, {
        height: '50%',
        maxHeight: '50vh',
        width: '400px',
        disableClose: true,
        autoFocus: false,
        panelClass: 'custom-dialog-transition'
      });
    }, 200);
  }
}






    dialogState: 'change' | 'reset' | 'new' = 'change';

    switchToReset() {
      this.dialogState = 'reset';
    }

    switchToChange() {
      this.dialogState = 'change';
    }

    switchToNew() {
      this.dialogState = 'new';
    }






      resetForm!: FormGroup;
      enablePasswordRest: boolean = false
      disablePaswordSendLink: boolean = true;
      submittedReset = false;
      isVisible: boolean = true
      idNotFound: boolean = false
      private apiUrl = environment.apiUrl;
      Email: string = '';



      DigitalUserResetPwdDetail: any = {
        email_id: "",
        pwd: "",  
        generatedToken: ""
      }

      sendToken() {
        this.DigitalUserResetPwdDetail.email_id = this.emailId;
        this.dataService.updateProgressBarSubject(true);
        this.http.post<any>(this.apiUrl + "/user/forgotPasswordID", this.DigitalUserResetPwdDetail).subscribe({
          next: (response) => {
            if (response.userCount > 0) {
              this.isVisible = false;
              this.enablePasswordRest = true
              this.disablePaswordSendLink = false
              this.Email = this.DigitalUserResetPwdDetail.email_id;
              this.switchToNew();
            } else {
              this.isVisible = false;
              this.idNotFound = true
            }
            this.dataService.updateProgressBarSubject(false);
          },
          error: (err) => {
            this.dataService.handleError(err, "Failed to send the email, please try again.");
          }
        });
      }
      onPasswordReset() {
        this.submittedReset = true
        if (this.resetForm.valid) {      
          this.DigitalUserResetPwdDetail.pwd = this.resetForm.get('pwd')?.value
          this.DigitalUserResetPwdDetail.generatedToken = this.resetForm.get('generatedToken')?.value
          
          this.http.post<any>(this.apiUrl + "/user/resetPassword", this.DigitalUserResetPwdDetail).subscribe({
            next: (response) => {
              
              if (response.userCount > 0) {
                console.log("Password Reset SuccessFulle")
                this.dialogService.openMessageDialog('Info', 'Password created successfully.').subscribe(res => window.location.href = '#/login');
      
              } else {
                this.dialogService.openMessageDialog('Error', 'Password Reset Failed , Please try again ').subscribe(res => window.location.href = '#/reset');;
      
              }
            }
          });






          
        } else {
          this.markAllFieldsAsTouched();
        }
      }

      get fr(): { [key: string]: AbstractControl } {

        return this.resetForm.controls;
      }
      markAllFieldsAsTouched() {
        Object.keys(this.resetForm.controls).forEach(field => {
          const control = this.resetForm.get(field);
          if (control) {
            control.markAsTouched();
          }
        });
      }

}

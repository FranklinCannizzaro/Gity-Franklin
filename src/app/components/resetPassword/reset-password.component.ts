import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../../Services/data.service';
import Validation from '../sign-up/Validation';
import { DialogService } from '../../Services/dialog.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatStepperModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {

  resetForm!: FormGroup;
  enablePasswordRest: boolean = false
  disablePaswordSendLink: boolean = true;
  submitted = false;
  isVisible: boolean = true
  idNotFound: boolean = false
  private apiUrl = environment.apiUrl;
  Email: string = '';

  constructor(private http: HttpClient, private dataService: DataService, private fb: FormBuilder, private dialogService: DialogService) {

  }

  ngOnInit() {
    this.resetForm = this.fb.group({
      generatedToken: ['', Validators.required],
      pwd: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(40),
      ],
      ],
      confirmPassword: ['', Validators.required],
     

    },
      {
        validators: [Validation.match('pwd', 'confirmPassword')],
      }
    );
  }

  DigitalUserResetPwdDetail: any = {
    email_id: "",
    pwd: "",  
    generatedToken: ""
  }

  sendToken() {
    this.http.post<any>(this.apiUrl + "/user/forgotPasswordID", this.DigitalUserResetPwdDetail).subscribe({
      next: (response) => {
        console.log(response)
        if (response.userCount > 0) {
          this.isVisible = false;
          this.enablePasswordRest = true
          this.disablePaswordSendLink = false
          this.Email = this.DigitalUserResetPwdDetail.email_id;

        } else {
          this.isVisible = false;
          this.idNotFound = true

        }
      }
    });
  }
  onPasswordReset() {
    this.submitted = true
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
      console.log("not cool")
    }
  }

  get f(): { [key: string]: AbstractControl } {

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



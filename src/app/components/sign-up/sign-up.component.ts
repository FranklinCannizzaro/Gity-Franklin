import { Component } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DataService } from '../../Services/data.service';
import { AbstractControlOptions, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../Services/dialog.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';


@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [MatTabsModule, MatSelectModule, MatFormFieldModule, FormsModule, CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatInputModule, MatIconModule, MatProgressSpinnerModule, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})

export class SignUpComponent {
  signupForm: FormGroup;
  userIdExists: boolean = false;
  userIdChecked: boolean = false;
  loading: boolean = false;
  saving: boolean = false;

  regView: String = "client";

  showSignupForm = true;
  showDesignerForm = false;

  constructor(private fb: FormBuilder, public dataService: DataService, private dialogService: DialogService, private router: Router) {
    this.signupForm = this.fb.group({
      userId: ['', [Validators.required, Validators.maxLength(40), this.validateUserId]],
      emailId: ['', [Validators.required, Validators.maxLength(100), Validators.email]],
      country: ['']

    });
  }

  ngOnInit(): void {

  }

  onSubmit(): void {
    this.dataService.updateProgressBarSubject(true);

    this.checkUserId()
      .then((userExists) => {
        if (userExists) {
          this.dataService.updateProgressBarSubject(false);
          return;
        }

        if (this.signupForm.valid) {
          const formData = {
            ...this.signupForm.value,
            role: 'ROLE_doctor',
          };
          const url = '/user/create-user/doctor';

          this.dataService.post(url, formData).subscribe({
            next: () => {
              this.dialogService.openMessageDialog('Info', 'User created successfully.');
              this.dataService.updateProgressBarSubject(false);
              this.router.navigate(['/login']);
            },
            error: () => {
              this.dialogService.openMessageDialog('Error', 'Account creation failed. Please try again.');
              this.dataService.updateProgressBarSubject(false);
            },
          });
        } else {
          this.dialogService.openMessageDialog('Error', 'Please fill all fields correctly.');
          this.dataService.updateProgressBarSubject(false);
        }
      })
      .catch(() => {
        this.dialogService.openMessageDialog('Error', 'Unexpected error occurred.');
        this.dataService.updateProgressBarSubject(false);
      });
  }


  checkUserId(): Promise<boolean> {
    return new Promise((resolve) => {
      const userId = this.signupForm.get('userId')?.value;

      if (!userId) {
        this.userIdExists = false;
        this.userIdChecked = false;
        resolve(false);
        return;
      }

      this.loading = true;
      this.dataService.get(`/user/exist/${userId}`).subscribe({
        next: (response) => {
          this.loading = false;

          if (response.isExistingUser === 1) {
            this.signupForm.get('userId')?.setErrors({ userIdExists: true });
            this.userIdExists = true;
            this.dialogService.openMessageDialog('Error', 'User ID already exists. Please choose another.');
            this.userIdChecked = false;
            resolve(true);
          } else {
            this.signupForm.get('userId')?.setErrors(null);
            this.userIdExists = false;
            this.userIdChecked = true;
            resolve(false);
          }
        },
        error: () => {
          this.dialogService.openMessageDialog('Error', 'Failed to validate the user. Please try again.');
          this.loading = false;
          resolve(true);
        },
      });
    });
  }


  validateUserId(control: any) {
    const isValid = /^[a-zA-Z0-9-]*$/.test(control.value || '');
    return isValid ? null : { invalidUserId: true };
  }

  showSignup(): void {

    this.showSignupForm = true;
    this.showDesignerForm = false;

  }

  showDesigner(): void {

    this.showSignupForm = false;
    this.showDesignerForm = true;
  }

  changeView(viewType: String): void {
    this.regView = viewType
  }

}
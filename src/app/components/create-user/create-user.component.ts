import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../Services/data.service';
import { DialogService } from '../../Services/dialog.service';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData {
  userId: string;
  emailId: string;
  role: string;
  coutry: string;
}

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [
    MatDialogModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,MatSelectModule, MatIconModule, MatButtonModule
  ],
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css'],
})
export class CreateUserComponent {
  signupForm: FormGroup;
  role: string[];
  country:string[];

  constructor(
    public dialogRef: MatDialogRef<CreateUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dataService: DataService,
    private dialogService: DialogService,
    private fb: FormBuilder
  ) {
    this.role = this.dataService.role === 'tl' ? ['designer'] : ['Doctor', 'Designer', 'Team Leader', 'Admin'];
    this.country = ['India','Germany','USA'];
    
    this.signupForm = this.fb.group({
      userId: ['', [Validators.required, this.validateUserId]],
      emailId: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]],
      country:['',[Validators.required]]

    });
  }

  roleMap: { [key: string]: string } = {
    Doctor: 'doctor',
    Designer: 'designer',
    'Team Leader': 'tl',
    Admin: 'admin'
  };

  onSubmit(): void {
    if (this.signupForm.valid) {
      const formData = {
        ...this.signupForm.value,
        role: 'ROLE_' + this.roleMap[this.signupForm.value.role],
      };
      const url = this.dataService.role === 'tl' ? '/user/create-user/tl' : '/user/create-user/admin';
      this.dataService.post(url, formData).subscribe({
        next: (response) => {
          this.dialogService.openMessageDialog('Info', 'User created successfully.');
          this.dialogRef.close(formData);
        },
        error: (error) => {
          this.dialogService.openMessageDialog(
            'Error',
            'Account creation failed. Please try again.'
          );
        },
      }); 
    } else {
      this.dialogService.openMessageDialog('Error', 'Please fill all fields correctly.');
    }
    this.dataService.updateProgressBarSubject(false);
  }

  cancel(): void {
    this.dialogRef.close(); // Close the dialog without doing anything
  }

  validateUserId(control: any) {
    const isValid = /^[a-zA-Z0-9-]*$/.test(control.value || '');
    return isValid ? null : { invalidUserId: true };
  }
}

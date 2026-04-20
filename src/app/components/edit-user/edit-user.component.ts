import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../Services/data.service';
import { UserDetails } from '../user-profile/user-profile.component';
import { DialogService } from '../../Services/dialog.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { ImageDialogComponent } from '../comments/image-dialog/image-dialog/image-dialog.component';


@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatIconModule, MatButtonModule, FormsModule, MatCheckboxModule],
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  timeZones = [
    { code: 'CET', display: 'Germany - CET (GMT+01:00) / CEST (GMT+02:00)' },
    { code: 'GMT', display: 'United Kingdom - GMT (GMT±00:00) / BST (GMT+01:00)' },
    { code: 'EST', display: 'United States (Eastern) - EST (GMT-05:00) / EDT (GMT-04:00)' },
    { code: 'PST', display: 'United States (Pacific) - PST (GMT-08:00) / PDT (GMT-07:00)' },
    { code: 'CST', display: 'United States (Central) - CST (GMT-06:00) / CDT (GMT-05:00)' },
    { code: 'MST', display: 'United States (Mountain) - MST (GMT-07:00) / MDT (GMT-06:00)' },
    { code: 'AEST', display: 'Australia - AEST (GMT+10:00) / AEDT (GMT+11:00)' },
    { code: 'IST', display: 'India - IST (GMT+05:30)' },
    { code: 'JST', display: 'Japan - JST (GMT+09:00)' },
    { code: 'SAST', display: 'South Africa - SAST (GMT+02:00)' },
    { code: 'UTC', display: 'Universal Time - UTC (GMT±00:00)' }
  ];

  skills = ['Crown / Bridge', 'Frame', 'Nightguard', 'RPD', 'Veneers', 'Telescope Tech'];
  software = ['Exocad', '3Shape'];

  userDetails: UserDetails | undefined;
  editForm: FormGroup;
  userId: string | null = null;
  comingFromUserList = false;
  fullName: string | null = null;
  isSubmitting = false;
  profileImageUrl: string | null = null;
  portfolioImages: string[] = [];
  selectedSoftware: string[] = [];
  showOtherInput = false;

  constructor(
    private fb: FormBuilder,
    public dataService: DataService,
    private dialogService: DialogService,
    private router: Router,
    private route: ActivatedRoute, 
    private dialog: MatDialog
  ) {
    this.editForm = this.fb.group({
      userId: ['', Validators.required],
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
      role: ['', Validators.required],
      emailId: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      additionalSkill: ['', Validators.maxLength(100)],
      about: ['', Validators.maxLength(500)],
      primarySkill: [[], Validators.required],
      timeZone: [[], Validators.required],
      prefLangCd: [[], Validators.required],
      software: [[], Validators.required],
      experience: ['', Validators.maxLength(100)],
      otherSoftware: ['']
    });
  }

  ngOnInit(): void {

    this.showOtherInput = this.editForm.get('software')?.value.includes('Other');
if (this.showOtherInput) {
  this.editForm.get('otherSoftware')?.enable();
} else {
  this.editForm.get('otherSoftware')?.disable();
}

    const idParam = this.route.snapshot.paramMap.get('id')?.trim();
    this.userId = idParam || this.dataService.userId;
    this.comingFromUserList = !!idParam;

    this.dataService.updateProgressBarSubject(true);
    this.dataService.get(`/user/${this.userId}`).subscribe({
      next: (data: UserDetails) => {
        this.userDetails = data;
        this.fullName = data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : 'N/A';

        const primarySkillArray = data.primarySkill ? data.primarySkill.split(',').map(s => s.trim()) : [];

        let software: string[] = [];
        if (data.software) {
          const rawList = data.software.split('|').map(s => s.trim()).filter(Boolean);
          let finalList: string[] = [];
        
          for (let i = 0; i < rawList.length; i++) {
            if (rawList[i] === 'Other') {
              const otherValue = rawList[i + 1]?.trim();
              if (otherValue) {
                this.editForm.get('otherSoftware')?.setValue(otherValue);
                finalList.push('Other'); 
                i++;
              }
            } else {
              finalList.push(rawList[i]);
            }
          }
        
          software = finalList;
        }
        

        this.editForm.patchValue({
          userId: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          emailId: data.emailId,
          additionalSkill: data.additionalSkill,
          about: data.about,
          primarySkill: primarySkillArray,
          timeZone: data.timeZone,
          prefLangCd: data.prefLangCd,
          software: software,
          experience: data.experience
        });

        this.selectedSoftware = software;
        this.showOtherInput = this.selectedSoftware.includes('Other');

        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to load user details');
      }
    });

    this.getPortfolioImages();
  }

  save(): void {
    if (this.editForm.valid) {
      this.isSubmitting = true;
      const formData = this.prepareFormData();

      this.dataService.post('/user/edit-user', formData)
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe({
          next: () => {
            this.dialogService.openMessageDialog('Success', 'Profile updated successfully').subscribe(() => {
              this.router.navigate([this.comingFromUserList ? '/user-list' : '/user-profile']);
            });
          },
          error: () => {
            this.dialogService.openMessageDialog('Error', 'Failed to update profile. Please try again.');
          }
        });
    } else {
      this.markFormGroupTouched(this.editForm);
      this.dialogService.openMessageDialog('Warning', 'Please fill in all required fields correctly.');
    }
  }

  private prepareFormData() {
    const formValue = { ...this.editForm.value };

    if (Array.isArray(formValue.software) && formValue.software.includes('Other')) {
      const other = this.editForm.get('otherSoftware')?.value?.trim();
      if (other) {
        formValue.software = formValue.software
          .filter((item: string) => item !== 'Other')
          .concat(['Other', other]);
      }
    }

    formValue.primarySkill = Array.isArray(formValue.primarySkill) ? formValue.primarySkill.join(', ') : formValue.primarySkill;
    formValue.software = Array.isArray(formValue.software) ? formValue.software.join('|') : formValue.software;

    return formValue;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel(): void {
    this.router.navigate([this.comingFromUserList ? '/user-list' : '/user-profile']);
  }

  getPortfolioImages(): void {
    this.dataService.get('/user/portfolio').subscribe({
      next: (images: string[]) => this.portfolioImages = images,
      error: () => {
        this.dialogService.openMessageDialog('Error', 'Failed to load portfolio images. Please try again.');
      }
    });
  }

  onUploadImages(event: any): void {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i], files[i].name);
      }

      this.dataService.updateProgressBarSubject(true);
      this.dataService.post('/user/portfolio', formData).subscribe({
        next: () => {
          this.getPortfolioImages();
          this.dialogService.openMessageDialog('Success', 'Images uploaded successfully');
        },
        error: () => {
          this.dialogService.openMessageDialog('Error', 'Failed to upload images. Please try again.');
        }
      });
    }
  }

  removeImage(imageName: string): void {
    this.dataService.updateProgressBarSubject(true);
    this.dataService.delete(`/user/portfolio?fileName=${imageName}`).subscribe({
      next: () => {
        this.getPortfolioImages();
        this.dataService.updateProgressBarSubject(false);
      },
      error: () => {
        this.dialogService.openMessageDialog('Error', 'Failed to remove image. Please try again.');
      }
    });
  }

  onCheckboxChange(event: MatCheckboxChange): void {
    const value = event.source.value;
    const checked = event.checked;
    const softwareArray = this.editForm.get('software')?.value || [];
  
    if (checked) {
      if (!softwareArray.includes(value)) {
        softwareArray.push(value);
      }
      if (value === 'Other') {
        this.showOtherInput = true;
        this.editForm.get('otherSoftware')?.enable();
      }
    } else {
      const index = softwareArray.indexOf(value);
      if (index > -1) {
        softwareArray.splice(index, 1);
      }
      if (value === 'Other') {
        this.showOtherInput = false;
        this.editForm.get('otherSoftware')?.disable();
        this.editForm.get('otherSoftware')?.reset();
      }
    }
  
    this.editForm.get('software')?.setValue(softwareArray);
    this.editForm.get('software')?.markAsTouched();
  }
  
  

  isChecked(value: string): boolean {
    return this.selectedSoftware.includes(value);
  }

   previewImage(imageName: string){
      this.dataService.updateProgressBarSubject(true);
      this.dataService.get('/user/portfolio-image?fileName='+ imageName).subscribe({
        next: (data: any) => {
          this.dataService.updateProgressBarSubject(false);
          this.dialog.open(ImageDialogComponent, { maxWidth: '80vw', height: 'auto', data: {imageSrc: 'data:image/*;base64,'+data.fileContents, preview: true} });
        },
        error: (err) => {
          this.dialogService.openMessageDialog('Error', 'Failed to get image. Please try again.');
        }
      });
    }

}

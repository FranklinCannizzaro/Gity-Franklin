import { Component, Inject, Optional, PipeTransform } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { DataService } from '../../Services/data.service';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../Services/dialog.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ImageDialogComponent } from '../comments/image-dialog/image-dialog/image-dialog.component';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { lastValueFrom, Observable } from 'rxjs';

export interface UserDetails {
  otherSoftware: string;
  userId: string;
  emailId: string;
  firstName: string;
  lastName: string;
  role: string;
  timeZone: string;
  additionalSkill: string;
  about: string;
  primarySkill: string;
  displayImageBytes: string;
  lastLogin: string;
  prefLangCd: string;
  software: string;
  experience: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [MatIconModule, CommonModule, RouterLink, MatDialogModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements PipeTransform {
  userDetails: UserDetails = {
    userId: '',
    emailId: '',
    firstName: '',
    lastName: '',
    role: '',
    timeZone: '',
    additionalSkill: '',
    about: '',
    primarySkill: '',
    displayImageBytes: '',
    lastLogin: '',
    prefLangCd: '',
    software: '',
    experience: '',
    otherSoftware: ''
  };

  portfolioImages: string[] = [];
  stats: any = {};
  showUploadButton: boolean = false;
  fromPopup: boolean = false;

  constructor(
    public dataService: DataService,
    private router: Router,
    private dialogService: DialogService,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() private dialogRef?: MatDialogRef<any>
  ) {}

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

  languageCodeMap: { [key: string]: string } = {
    'en': 'English',
    'de': 'German',
    'fr': 'French',
    'es': 'Spanish'
  }

  get userLocation() {
    return this.timeZones.find(tz => tz.code === this.userDetails.timeZone)?.display.split(' - ')[0];
  }

  transform(value: string): string {
    return value?.replace('ROLE_', '') || 'Not Specified';
  }

  splitValue(value: string): string[] {
    if (!value) return [];
    return value.split(', ');
  }
  
  userId: string = '';

  ngOnInit(): void {
    this.fromPopup = this.data?.fromPopup ?? false;
    this.isFav = this.data?.isUserFav ?? false;
  
    if (this.fromPopup) {
      this.userId = this.data?.userId;  
    }else{
      this.userId = this.dataService.userId;
    }

    if (!this.userId) {
      console.error('Missing userId!');
      return;
    }
  
    this.dataService.get('/user/' + this.userId).subscribe({
      next: (data: UserDetails) => {
        this.userDetails = data;
        // this.dataService.displayImageBytes = data.displayImageBytes;
        this.userDetails.role = this.transform(data.role.trim().replace('ROLE_', '').toUpperCase());
        this.getPortfolioImages(this.fromPopup ? this.userId : '');
        this.getRatings(this.fromPopup ? this.userId : '');
        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to load user details, Please try again.');
      }
    });
  }
  

  get calculateProfileCompletion(): number {
    const totalFields = Object.keys(this.userDetails).length + 1;
    let filledFields = 0;

    for (const key in this.userDetails) {
      const property = key as keyof UserDetails;
      if (this.userDetails[property]) filledFields++;
    }

    if (this.portfolioImages.length > 0) filledFields++;

    return Math.round((filledFields / totalFields) * 100);
  }

  editUser(): void {
    if (!this.fromPopup) {
      this.router.navigate(['/edit-user']);
    }
  }

  potfolioImagesData: any[] = [];

  getPortfolioImages(userId: string = ''): void {
    this.dataService.get('/user/portfolio'+(userId ? '/'+userId : '')).subscribe({
      next: async (images: string[]) => {
        this.portfolioImages = images;
        this.potfolioImagesData = await Promise.all(
          this.portfolioImages.map(async image => {
            let token = await firstValueFrom(this.getImageContent(image, userId));
            return { name: image, content: token };
          })
        );
        console.log('Portfolio images loaded:', this.potfolioImagesData);
      },
      error: (err) => {
        this.dialogService.openMessageDialog('Error', 'Failed to load portfolio images. Please try again.');
      }
    });
  }

  getRatings(userId: string = ''): void {
    this.dataService.get('/user/ratings?userId='+userId).subscribe({
      next: (response: any) => {
        this.stats = response;
      },
      error: (err) => {
        this.dialogService.openMessageDialog('Error', 'Failed to get user ratings. Please try again.');
      }
    });
  }
  getImageContent(imageName: string, userId: string = '') {
    this.dataService.updateProgressBarSubject(true);
    return new Observable<string>((observer) => {
      this.dataService.get('/user/portfolio-image?fileName=' + imageName+'&userId='+userId).subscribe({
        next: (data: any) => {
          this.dataService.updateProgressBarSubject(false);
          observer.next('data:image/*;base64,' + data.fileContents);
          observer.complete();
        },
        error: (err) => {
          this.dialogService.openMessageDialog('Error', 'Failed to get image. Please try again.');
          observer.error(err);
        }
      });
    });
  }
  

  previewImage(imageName: string): void {
    this.dataService.updateProgressBarSubject(true);
    this.dataService.get('/user/portfolio-image?fileName=' + imageName).subscribe({
      next: (data: any) => {
        this.dataService.updateProgressBarSubject(false);
        this.dialog.open(ImageDialogComponent, {
          maxWidth: '80vw',
          height: 'auto',
          data: {
            imageSrc: 'data:image/*;base64,' + data.fileContents,
            preview: true
          }
        });
      },
      error: (err) => {
        this.dialogService.openMessageDialog('Error', 'Failed to get image. Please try again.');
      }
    });
  }

  getFormattedSoftware(software: string, otherSoftware: string): string {
    if (!software) return '';
    return software
      .split('|')
      .filter(item => item !== 'Other' && item !== otherSoftware)
      .join(', ');
  }

  closePopup(): void {
    this.dialogRef?.close({ isFav: this.isFav });
  }

  onFileSelected(event: any): void {
    if (this.fromPopup) return;

    const file: File = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file, file.name);

      this.dataService.updateProgressBarSubject(true);
      this.dataService.post('/user/dp', formData).subscribe({
        next: () => this.ngOnInit(),
        error: (err) => {
          this.dialogService.handleError(err, 'Failed to upload display image, Please try again.');
        }
      });
    }
  }

  createTask() {
    if(this.data?.fromSearch){
      this.dialogRef?.close({ createTask: true, isFav: this.isFav });
    }else{
      this.dialogRef?.close();
      this.router.navigate(['/create-task-demo'], { queryParams: {
        designer: this.userId, 
        isFav: this.isFav, 
        rating: this.stats.ratings, 
        experience: this.userDetails.experience, 
        skill: this.userDetails.primarySkill, 
        software: this.getFormattedSoftware(this.userDetails.software, this.userDetails.otherSoftware)
      } });
    }
  }

    saveUser(){
      if(this.isFav){
        this.unFollowDesigner(this.userId);
      } else {
        this.followDesigner(this.userId);
      }
    }


    isFav: boolean = false;

    followDesigner = (userId: string) => {
      const formData = new FormData();
      formData.append('designerId', userId);
      this.dataService.updateProgressBarSubject(true);
      this.dataService.post('/user/follow', formData).subscribe({
        next: (response: any) => {
          this.isFav = true;
          this.dataService.updateProgressBarSubject(false);
        },
        error: (err: any) => {
          this.dataService.updateProgressBarSubject(false);
          this.dialogService.handleError(err, 'Failed to follow designer, Please try again.');
        }
      });
    }

    unFollowDesigner = (userId: string) => {
      const formData = new FormData();
      formData.append('designerId', userId);
      this.dataService.updateProgressBarSubject(true);
      this.dataService.post('/user/unFollowDesigner', formData).subscribe({
        next: (response: any) => {
          this.isFav = false;
          this.dataService.updateProgressBarSubject(false);
        },
        error: (err: any) => {
          this.dataService.updateProgressBarSubject(false);
          this.dialogService.handleError(err, 'Failed to unfollow designer, Please try again.');
        }
      });
    }



}
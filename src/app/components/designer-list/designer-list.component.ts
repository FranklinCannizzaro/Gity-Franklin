import { Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { DataService } from '../../Services/data.service';
import { Router } from '@angular/router';
import { Inject } from '@angular/core';
import { DialogService } from '../../Services/dialog.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { compileFunction } from 'vm';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';
import { UserDetails } from '../user-profile/user-profile.component';
import { MatDialog } from '@angular/material/dialog';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms'; 
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

export interface User {
otherSoftware: string;
  userId: string;
  emailId: string;
  firstName: string;
  lastName: string;
  role: string;
  primarySkill: string;
  lastlogin: string;
  tier: string;
  userRating: number;
  country:string;
  displayImageBytes: String;
  followers: string;
  software: string;
  experience: string;
}
@Component({
  selector: 'app-designer-list',
  standalone: true,
   imports: [MatInputModule,MatFormFieldModule,CommonModule, MatIconModule, MatCardModule, MatDialogModule, MatButtonModule,MatProgressSpinnerModule,MatSlideToggleModule,FormsModule],
  templateUrl: './designer-list.component.html',
  styleUrl: './designer-list.component.css'
  // ,
  // encapsulation: ViewEncapsulation.None

 
})


export class DesignerListComponent {


  apiUrl = environment.apiUrl;

  users: User[] = [];
  usersByDR: User[] = [];
  fetchedAll = false;

    filteredUsers: User[] = [];
    filteredUsersByDR: User[] = [];
    selectedUser: string = '';
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
      prefLangCd: ''
      ,software: '',
      experience: '',
      otherSoftware: ''
    };

  constructor(public dataService: DataService, private router: Router, private dialogService: DialogService, private dialog: MatDialog) { 
  
  }


  getStarFill(index: number, rating: number): number {
    const full = index + 1;
    if (rating >= full) {
      return 100;
    } else if (rating > index && rating < full) {
      return (rating - index) * 100;
    }
    return 0;
  }


  ngOnInit() {
    this.dataService.updateTitle("Designer List");
    
    this.getFavouriteList();
    
  }

  showAll(){
    this.showFavouriteuse = false;
    if(!this.fetchedAll){
      this.getUserList();
      this.fetchedAll = true;
    }
  }

  showFav(){
    this.showFavouriteuse = true;
  }



  
  openUserProfile(userId: string): void {
    this.router.navigate(['/user', userId]); // Uncommented this line to enable navigation
    this.dataService.get('/user/' + userId).subscribe({
        next: (data: UserDetails) => {
            this.userDetails = data;
            this.dataService.displayImageBytes = this.userDetails.displayImageBytes;
            this.userDetails.role = this.transform(this.userDetails.role.trim().replace('ROLE_', '').toUpperCase());
            this.getPortfolioImages();
            // this.getRatings();
            this.dataService.updateProgressBarSubject(false);
        },
        error: (err) => {
            this.dialogService.handleError(err, 'Failed to load user details, Please try again.');
        }
    });
}






openUserProfilePopup(userId: string, isUserFav: boolean): void {
  this.dialog.open(UserProfileComponent, {
    data: {
      userId: userId,
      fromPopup: true,
      isUserFav: isUserFav
    },
    // width: '50vw',
    minWidth: '50vw',
    // maxWidth: '90vw',
    disableClose: true
  }).afterClosed().subscribe(result => {
    if (result && result.isFav !== isUserFav) {
      if(result.isFav) {
          var userToFav = this.users.filter(user => user.userId == userId)[0];
          this.usersByDR.push(userToFav);
          this.users.splice(this.users.indexOf(userToFav), 1);
          this.filteredUsers = this.users;
      }
      else {
          var userToUnFav = this.usersByDR.filter(user => user.userId == userId)[0];
          this.users.push(userToUnFav);
          this.usersByDR.splice(this.usersByDR.indexOf(userToUnFav), 1);
          this.filteredUsersByDR = this.usersByDR;

          if(this.filteredUsersByDR.length == 0){
            this.showAll();
          }
      }
    }
    // Handle other actions if needed
  });
}

  ratings: number = 0;

  getRatings(): void {
    this.dataService.get('/user/ratings').subscribe({
      next: (response: any) => {
        this.ratings = response.ratings;
      },
      error: (err) => {
        this.dialogService.openMessageDialog('Error', 'Failed to get user ratings. Please try again.');
      }
    });
  }

  portfolioImages: string[] = [];

  getPortfolioImages(): void {
    this.dataService.get('/user/portfolio').subscribe({
      next: (images: string[]) => {
        this.portfolioImages = images;
      },
      error: (err) => {
        this.dialogService.openMessageDialog('Error', 'Failed to load portfolio images. Please try again.');
      }
    });
  }


  transform(value: string): string {
    return value?.replace('ROLE_', '') || 'Not Specified';
  }



  @ViewChild('designerInput') designerInputRef!: ElementRef<HTMLInputElement>;

  searchInputValue: string = '';
  isInputActive: boolean = false;

  onInputBlur(value: string): void {
    this.isInputActive = false;
    this.searchInputValue = value;
  }

  focusInput(): void {
    if (this.designerInputRef) {
      this.designerInputRef.nativeElement.focus();
    }
  }


  filterUsers(event: Event) { 
    const searchTerm = (event.target as HTMLInputElement).value;

    this.searchInputValue = searchTerm;

    if(this.showFavouriteuse){
      this.filteredUsersByDR = this.usersByDR.filter(user => 
        JSON.stringify(user)
        .replace('ROLE_tl', 'Team Lead')
        .replace('ROLE_designer', 'Designer')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      );
    }else{
      this.filteredUsers = this.users.filter(user => 
        JSON.stringify(user)
        .replace('ROLE_tl', 'Team Lead')
        .replace('ROLE_designer', 'Designer')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      );
    }

  }

  showFavouriteuse : boolean = true;
  getUserList(){
      this.dataService.updateProgressBarSubject(true);
      this.dataService.getDataAsList('/user/designers').subscribe({
        next: (response: User[]) => {
          this.users = response;
          this.filteredUsers = response;    
           
          this.users.filter(user => {
            if(user.userRating == null || user.userRating == undefined || user.userRating == 0){
              user.userRating = this.getDisplayValue(user.experience);
             
            }
            this.dataService.updateProgressBarSubject(false);
          });
        },
        error: (err) => {
         
        }
      });
    }

        defaultRatingValue: number | null = null;
      
    

        getDisplayValue(experience: string): number {
          const num = Number(experience);
          if (isNaN(num)) return 2.5;
          const value = Math.max(0, Math.min(num, 30));
          const rating = 2.5 + (value / 30) * (5.0 - 2.5);
          return parseFloat(rating.toFixed(1));
        }
    
    getFavouriteList(){
     
      this.dataService.updateProgressBarSubject(true);
      this.dataService.getDataAsList('/user/favourite').subscribe({
        next: (response: User[]) => {
          this.usersByDR = response;
          this.filteredUsersByDR = response;
          if(this.usersByDR.length == 0){
            this.showAll();
          }else{
            this.dataService.updateProgressBarSubject(false);
          }
          this.usersByDR.filter(user => {
            if(user.userRating == null || user.userRating == undefined || user.userRating == 0){
              user.userRating = this.getDisplayValue(user.experience);
             
            }
          });
          this.dataService.updateProgressBarSubject(false);
        },
        error: (err) => {
          //this.dialogService.handleError(err, 'Failed to get Designer list, Please try again.');
        }
      });
    }


    createTask(userId: string, isFav: boolean, rating: number, experience: string, skill: string, software: string) {
      this.router.navigate(['/create-task-demo'], { queryParams: {designer: userId, isFav: isFav, rating: rating, experience: experience, skill: skill, software: software} });
    }

    followDesigner = (userId: string) => {
      const formData = new FormData();
      formData.append('designerId', userId);
      this.dataService.updateProgressBarSubject(true);
      this.dataService.post('/user/follow', formData).subscribe({
        next: (response: any) => {
          // this.ngOnInit();
          var userToFav = this.users.filter(user => user.userId == userId)[0];
          this.usersByDR.push(userToFav);
          this.users.splice(this.users.indexOf(userToFav), 1);
          this.filteredUsers = this.users;

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
          // this.getFavouriteList();
          // this.showFavouriteuse = true;

          var userToUnFav = this.usersByDR.filter(user => user.userId == userId)[0];
          this.users.push(userToUnFav);
          this.usersByDR.splice(this.usersByDR.indexOf(userToUnFav), 1);
          this.filteredUsersByDR = this.usersByDR;

          if(this.filteredUsersByDR.length == 0){
            this.showAll();
          }

          this.dataService.updateProgressBarSubject(false);
          
        },
        error: (err: any) => {
          this.dataService.updateProgressBarSubject(false);
          this.dialogService.handleError(err, 'Failed to unfollow designer, Please try again.');
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


  
    
    onToggleChange(event: MatSlideToggleChange): void {
      if (event.checked) {
        this.showFav();
      } else {
        this.showAll();
      }

}


getUserRatingDecimal(rating: number): string {
  const decimal = Math.round((rating % 1) * 10);
  return decimal === 0 ? '0' : decimal.toString();
}
favouriteIds: Set<string> = new Set();



}

import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { DialogService } from '../../Services/dialog.service';
import { DataService } from '../../Services/data.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../environments/environment';
// Removed duplicate import of MatSlideToggleChange
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCommonModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';


export interface User {
otherSoftware: string;
  userId: string;
  emailId: string;
  firstName: string;
  lastName: string;
  role: string;
  primarySkill: string;
  lastlogin: string;
  tier: string
  userRating:number;
  country:string
  displayImageBytes: String;

  software: string;
  experience: string;
}

@Component({
  selector: 'app-designer-search',
  standalone: true,

imports: [FormsModule,CommonModule, MatIconModule, MatCardModule, MatDialogModule, MatButtonModule,MatInputModule,MatCommonModule, MatFormFieldModule,MatSlideToggleModule],
  templateUrl: './designer-search.component.html',
  styleUrl: './designer-search.component.css'
})
export class DesignerSearchComponent {

  apiUrl = environment.apiUrl;
  
  users: User[] = [];
  usersByDR: User[] = [];
  fetchedAll = false;

  filteredUsers: User[] = [];

  selectedUser: string = '';
  selectedIsFav: boolean = false;
  selectedRating: number = 0;
  selectedExperience: string = '';
  selectedSkill: string = '';
  selectedSoftware: string = '';

   filteredUsersByDR: User[] = [];

  

      constructor(private dialog: MatDialog,private dialogService: DialogService, public dataService: DataService, private dialogRef: MatDialogRef<DesignerSearchComponent>, @Inject(MAT_DIALOG_DATA) public data: any){ 
        this.selectedUser = data.designer;
        this.selectedIsFav = data.isFav;
        this.selectedRating = data.rating;
        this.selectedExperience = data.experience;
        this.selectedSkill = data.skill;
        this.selectedSoftware = data.software;
      }

  searchText: string = '';


  getStarFill(index: number, rating: number): number {
    const full = index + 1;
    if (rating >= full) {
      return 100;
    } else if (rating > index && rating < full) {
      return (rating - index) * 100;
    }
    return 0;
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

  ngOnInit(){
    
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

  getDisplayValue(experience: string): number {
    const num = Number(experience);
    if (isNaN(num)) return 2.5;
    const value = Math.max(0, Math.min(num, 30));
    const rating = 2.5 + (value / 30) * (5.0 - 2.5);
    return parseFloat(rating.toFixed(1));
  }
  
  openUserProfilePopup(userId: string, isFav: boolean, rating: number, experience: string, skill: string, software: string): void {
    this.dialog.open(UserProfileComponent, {
      data: {
        userId: userId,
        fromPopup: true,
        isUserFav: isFav,
        fromSearch: true
      },
      width: '70vw',
      minWidth: '200px',
      maxWidth: '90vw',
      disableClose: true
    }).afterClosed().subscribe(result => {
      if(result && result.createTask) {
        this.createTask(userId, result.isFav, rating, experience, skill, software);
        return
      }

      if (result && result.isFav !== isFav) {
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


    onToggleChange(event: MatSlideToggleChange): void {
        if (event.checked) {
          this.showFav();
        } else {
          this.showAll();
        }
  
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
           
          },
          error: (err) => {
            //this.dialogService.handleError(err, 'Failed to get Designer list, Please try again.');
          }
        });
      }

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
        });
        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get Designer list, Please try again.');
      }
    });
  }


  defaultRatingValue: number | null = null;
  
  // handleCardClick(event: MouseEvent, userId: string) {
  //   const isSelectButton = (event.target as HTMLElement).closest('.select-button');
  //   if (!isSelectButton) {
  //     this.openUserProfilePopup(userId);
  //   }
  // }

  createTask(userId: string, isFav: boolean, rating: number, experience: string, skill: string, software: string) {
      this.dialogRef.close({designer: userId, isFav: isFav, rating: rating, experience: experience, skill: skill, software: software});
    }


    followDesigner = (userId: string) => {
      const formData = new FormData();
      formData.append('designerId', userId);
      this.dataService.updateProgressBarSubject(true);
      this.dataService.post('/user/follow', formData).subscribe({
        next: (response: any) => {
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

    showFavouriteuse  : boolean = true;
    unFollowDesigner = (userId: string) => {
      const formData = new FormData();
      formData.append('designerId', userId);
      this.dataService.updateProgressBarSubject(true);
      this.dataService.post('/user/unFollowDesigner', formData).subscribe({
        next: (response: any) => {
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

   
  

}

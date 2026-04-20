import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DataService } from '../../Services/data.service';
import { DialogService } from '../../Services/dialog.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpHeaders } from '@angular/common/http';




@Component({
  selector: 'app-user-test',
  standalone: true,
  imports: [MatCardModule, MatDialogModule,CommonModule,MatButtonModule,FormsModule,MatIconModule,MatFormFieldModule,MatSelectModule,ReactiveFormsModule,MatProgressBarModule],
  templateUrl: './user-test.component.html',
  styleUrl: './user-test.component.css'
})
export class UserTestComponent {
  name = 'Progress Bar';
  isLoading: boolean = false;
  assessmentId: string = '';


  public counts = ["Started", "In-Progress", "Pending Evaluation", "Completed"];
  public orderStatus = "";
  public progressValue = 0;


  private readonly STATUS_MAP = {
    ST: { status: "Started", progress: 25 },        // Started (Red)
    IP: { status: "In-Progress", progress: 50 },    // In Progress (Blue)
    PE: { status: "Pending Evaluation", progress: 75 }, // Pending (Orange)
    CO: { status: "Completed", progress: 100 },     // Completed (Green)
    RJ: { status: "Failed", progress: 100 }         // Failed (Red)
  };


  status: String = '';

 
  hasDownloaded: boolean = false;

  designComments: string = '';
  reviewComments: string = '';

  constructor(public dataService: DataService, private dialogService: DialogService, private router: Router){

  }


  
  designerLevel: string = '1';
  
  uploadedFiles: string[] = [];

  uploadProgress: number = 0;


  tiers: { [key: string]: string } = {
    1: 'GOLD', 2: 'SILVER', 3: 'PLATINUM'
  }


  ngOnInit(): void {
    this.dataService.updateProgressBarSubject(true);
    this.dataService.get('/assessment').subscribe({
      next: (response: any) => {
        this.assessmentId = response.id;
        this.status = response.status ? response.status : 'ST';
        this.reviewComments = response.reviewComments;
        this.designComments = response.designComments;
        this.uploadedFiles = response.files ? response.files.split(',') : [];
        this.designerLevel = response.assessmentFileId?.toString();

        const statusValue = response.status as keyof typeof this.STATUS_MAP;
        const mappedStatus = this.STATUS_MAP[statusValue] || this.STATUS_MAP.ST;
        
        this.orderStatus = mappedStatus.status;
        this.progressValue = mappedStatus.progress;
        this.dataService.updateProgressBarSubject(false);
      },
      error: (error) => {
        this.dialogService.openMessageDialog('Error', 'Failed to fetch assessment. Please try again.');
        this.setInitialState();
      }
    });
  }
  

  onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach((file) => {
          this.dataService.updateProgressBarSubject(true);
          this.uploadFile(file).subscribe({
          next: (response) => {
            this.dataService.updateProgressBarSubject(false);
            this.uploadedFiles.push(file.name);
          }
        });
      });
    }
  }

  
  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  
  onSubmit(): void {
    if (this.designerLevel && this.uploadedFiles.length > 0 && this.designComments && this.designComments.trim() !== '') {
      this.dataService.updateProgressBarSubject(true);
      this.dataService.post('/assessment', {designComments: this.designComments.trim()}).subscribe({
        next: (statusResponse: any) => {
          this.orderStatus = "Pending Evaluation";
          this.progressValue = 75;
          this.dialogService.openMessageDialog("Info:", "Thanks for submitting evaluation, We will update you.");
          this.dataService.updateProgressBarSubject(false);
          this.ngOnInit();
        },
        error: (err) => {
          this.dialogService.handleError(err, 'Failed to update status');
        }
      });
    }
  }

  downloadFiles(): void {
    // Get the numeric value based on selected designer
    const designerLevelText = this.tiers[this.designerLevel];
    
    this.dataService.get('/assessment/files/' + designerLevelText, { 
      responseType: 'blob',
      observe: 'response'  
    }).subscribe({
      next: (response: any) => {
        const blob = new Blob([response.body], { type: 'application/octet-stream' });
        const filename = designerLevelText + '.zip';
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.hasDownloaded = true;   
        
        
        this.dataService.post('/assessment/createAssessmentEntry/' + this.designerLevel, {userId: this.dataService.userId}).subscribe({
          next: (response: any) => {
            this.orderStatus = "In-Progress";
            this.progressValue = 50;
            this.ngOnInit();
          },
          error: (err) => {
            console.error('Failed to create assessment entry:', err);
            this.dialogService.handleError(err, 'Failed to create assessment entry. Please try again.');
            this.hasDownloaded = false;
          }
        });



      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to download files');
        this.hasDownloaded = false;
      }
    });
  }

  isFormEnabled(): boolean {
    return this.orderStatus === "In-Progress"; 
  }


  uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('assessmentId', this.assessmentId);
    const headers = new HttpHeaders({
      'X-Digital-FileName': file.name
    });

    return this.dataService.postMultiPartData('/assessment/upload', formData, headers);
  }

  isStepCompleted(step: string): boolean {
    const stepOrder = {
      'Started': 1,
      'In-Progress': 2,
      'Pending Evaluation': 3,
      'Completed': 4,
      'Failed': 5
    };

    const currentStepValue = stepOrder[this.orderStatus as keyof typeof stepOrder] || 0;
    const thisStepValue = stepOrder[step as keyof typeof stepOrder] || 0;
   
    return thisStepValue <= currentStepValue;
  }

  getStepIcon(step: string): string {
    
    if (this.status === 'CO' || this.status === 'RJ') {
      if (step === 'Completed') {
        return this.status === 'CO' ? 'check_circle' : 'cancel';
      }
      return 'check';
    }
   
    if (step === this.orderStatus) {
      return 'radio_button_unchecked';
    }
   
    if (this.isStepCompleted(step)) {
      return 'check';
    }
    
    return 'radio_button_unchecked';
  }

  private setInitialState(): void {
    this.orderStatus = 'Started';
    this.progressValue = 25;
  }

 
}

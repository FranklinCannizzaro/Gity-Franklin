import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { DialogService } from '../../Services/dialog.service';
import { DataService } from '../../Services/data.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MyBoolean } from '../create-task-demo/create-task-demo.component';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';

export interface FileDetails {
  fileId: number;
  fileType: string;
  fileName: string;
}

@Component({
  selector: 'app-doctor-review-dialog',
  standalone: true,
  imports: [MatCardModule, MatDialogModule, CommonModule, MatButtonModule, FormsModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './doctor-review-dialog.component.html',
  styleUrl: './doctor-review-dialog.component.css'
})
export class DoctorReviewDialogComponent {

  taskId: number;
  refNum: string;
  taskStatus: string = '';
  comment: string = '';
  remainingCorrections: number = 0;

  feedbackId: string = '';
  cancelReason: string = '';
  tier: string = '';

  fileDetailsDesign: FileDetails[] = [];
  fileDetailsVisual: FileDetails[] = [];
  fileDetailsCorrectedDesign: FileDetails[] = [];
  fileDetailsCorrectedVisual: FileDetails[] = [];


  constructor(private dialog: MatDialog, private dialogService: DialogService, public dataService: DataService, private dialogRef: MatDialogRef<DoctorReviewDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private router: Router){ 
    this.taskId = data.taskId;
    this.refNum = data.refNum;
    this.fileDetailsDesign = data.fileDetailsDesign;
    this.fileDetailsVisual = data.fileDetailsVisual;
    this.fileDetailsCorrectedDesign = data.fileDetailsCorrectedDesign;
    this.fileDetailsCorrectedVisual = data.fileDetailsCorrectedVisual;
    this.taskStatus = data.taskStatus;
    this.cancelReason = data.cancelReason;
    this.feedbackId = data.feedbackId;
    this.remainingCorrections = data.remainingCorrections;
    this.tier = data.tier;
  }

  ngOnInit(){

  }
 
   close(){
    this.dialogRef.close();
   }

  downloadFile(fileId: number, fileName: string){
    this.dataService.updateProgressBarSubjectForSlider(true);
    this.dataService.get('/tasks/'+this.taskId+'/files/'+fileId, { responseType: 'blob' }).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/octet-stream' });
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        this.dataService.updateProgressBarSubjectForSlider(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to download the file, Please try again.');
      }
    }); 
  }

  confirmAction(){
    this.dialog.open(ConfirmDialogComponent, { width: '25%', data: { title: 'Confirm Task Action', lines: ['Case / Patient: ' + this.refNum, 'Task Id: ' + this.taskId] } }).afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
    });
  }

  feedbackMap = new Map<string, string>([
    ['3', 'Approve'],
    ['2', 'Corrections Required'],
    ['1', 'Cancel Task']
  ]);

  
  submitFeedback() {

    if(!this.feedbackId){
      this.dialogService.openMessageDialog('Error', 'Please select one Feedback option.');
      return;
    }

    if(this.feedbackId == '1' && !this.cancelReason){
      this.dialogService.openMessageDialog('Error', 'Please select a reason for cancelling the task.');
      return;
    }

    this.dialog.open(ConfirmDialogComponent, { width: '25%', data: { title: 'Confirm Task Feedback?', lines: ['Case / Patient: ' + this.refNum, 'Task Id: ' + this.taskId, 'Feedback: ' + this.feedbackMap.get(this.feedbackId)] } }).afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.dataService.updateProgressBarSubject(true);
      var commentToSave = this.feedbackId == '1' ? this.cancelReason : this.comment;
      this.dataService.put('/tasks/'+this.data.taskId+'/feedback', {feedbackId: this.feedbackId, comment: commentToSave, rating: this.rating}).subscribe({
        next: (response) => {
          this.dataService.updateProgressBarSubject(false);
          this.taskStatus = this.feedbackId == '2' ? 'IC' : 'CO';
          this.dialogService.openMessageDialog('Info', 'Saved the Feedback successfully.').subscribe(response => {
              this.dialogRef.close(true);
              this.router.navigate(['/task-list/delivered']);
            }
          );

        },
        error: (err) => {
          this.dialogService.handleError(err, 'Failed to save Feedback, Please try again.');
        }
      });

    });
  }
  

  rating = 0;
  hoveredRating = 0;
  stars = [1, 2, 3, 4, 5];

  rate(value: number) {
    this.rating = value;
  }

  hover(value: number) {
    this.hoveredRating = value;
  }


}


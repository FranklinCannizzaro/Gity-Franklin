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
import e from 'express';

export interface FileDetails {
  fileId: number;
  fileType: string;
  fileName: string;
}

@Component({
  selector: 'app-files-dialog',
  standalone: true,
  imports: [MatCardModule, MatDialogModule, CommonModule, MatButtonModule, FormsModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './files-dialog.component.html',
  styleUrl: './files-dialog.component.css'
})
export class FilesDialogComponent {

  taskId: number;
  refNum: string;
  taskStatus: string;

  fileDetailsScan: FileDetails[] = [];
  fileDetailsImages: FileDetails[] = [];
  fileDetailsImagesContent: string[] = [];
  fileDetailsOrderForm: FileDetails[] = [];
  fileDetailsDesign: FileDetails[] = [];
  fileDetails3dVisualisation: FileDetails[] = [];
  fileDetailsDesignImages: FileDetails[] = [];
  fileDetailsCorrectedDesign: FileDetails[] = [];
  fileDetailsCorrected3dVisualisation: FileDetails[] = [];

  constructor(private dialog: MatDialog, private dialogService: DialogService, public dataService: DataService, private dialogRef: MatDialogRef<FilesDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private router: Router){ 
    this.taskId = data.taskId;
    this.refNum = data.refNum;
    this.taskStatus = data.taskStatus;
  }

ngOnInit(){
    this.getFileDetails();
   }
 
   close(){
  

    this.dialogRef.close({
      fileDetailsScan: this.fileDetailsScan, 
      fileDetailsImages: this.fileDetailsImages, 
      fileDetailsImagesContent: this.fileDetailsImagesContent,
      fileDetailsOrderForm: this.fileDetailsOrderForm, 
      fileDetailsDesign: this.fileDetailsDesign, 
      fileDetailsCorrectedDesign: this.fileDetailsCorrectedDesign,
      fileDetailsCorrected3dVisualisation: this.fileDetailsCorrected3dVisualisation
    });


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

  async populateImagesContent(fileId: number) {
    try {
      const response = await firstValueFrom(this.dataService.get('/tasks/' + this.taskId + '/files/' + fileId, { responseType: 'blob' }));
      this.fileDetailsImagesContent.push(URL.createObjectURL(new Blob([response], { type: 'application/octet-stream' })));
    } catch (err) {
      this.dialogService.handleError(err, 'Failed to get File Contents, Please try again.');
    }
  }

  getFileDetails(){
    this.dataService.updateProgressBarSubjectForSlider(true);
    this.dataService.getDataAsList('/tasks/'+this.taskId+'/files').subscribe({
      next: (response: FileDetails[]) => {
        this.fileDetailsScan = [];
        this.fileDetailsDesign = [];
        this.fileDetailsImages = [];
        this.fileDetailsImagesContent = [];
        this.fileDetails3dVisualisation = [];
        this.fileDetailsDesignImages = [];
        this.fileDetailsOrderForm = [];
        this.fileDetailsCorrectedDesign = [];
        this.fileDetailsCorrected3dVisualisation = [];
        
        response.forEach(file => {
          if(file.fileType == 'scan'){
            this.fileDetailsScan.push(file);
          }else if(file.fileType == 'images'){
            this.fileDetailsImages.push(file);
            this.populateImagesContent(file.fileId);
          }else if(file.fileType == 'visual'){
            this.fileDetails3dVisualisation.push(file);
          }else if(file.fileType == 'designimages'){
            this.fileDetailsDesignImages.push(file);
          }else if(file.fileType == 'orderform'){
            this.fileDetailsOrderForm.push(file);
          }else if(file.fileType == 'correcteddesign'){
            this.fileDetailsCorrectedDesign.push(file);
          }else if(file.fileType == 'correctedvisual'){
            this.fileDetailsCorrected3dVisualisation.push(file);
          }else{
            this.fileDetailsDesign.push(file);
          }
        });
        
        this.dataService.updateProgressBarSubjectForSlider(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get Files for this Task, Please try again.');
      }
    });
  }

  visualFileTypes = ['html', 'jpg', 'jpeg', 'png', 'webp'];
  designFileTypes = ['stl'];

  addFileDetails(event: any, fileType: string = ''){
    var fileList: FileList = event.target.files;
    if (fileList.length == 0) {
      this.dialogService.openMessageDialog('Error', 'Select a file to Upload.');
    }else{
      
      if(fileType == 'visual'){
        var allowedFilesOk: Boolean = Array.from(fileList).every(file => this.visualFileTypes.some(allowed => file.name.toLowerCase().endsWith(allowed)));
        if(!allowedFilesOk){
          this.dialogService.openMessageDialog('Error', 'Please upload only pdf or svg 3D Visalisation files.');
          return;
        }
      }

      if(fileType == 'design'){
        var allowedFilesOk: Boolean = Array.from(fileList).every(file => this.designFileTypes.some(allowed => file.name.toLowerCase().endsWith(allowed)));
        if(!allowedFilesOk){
          this.dialogService.openMessageDialog('Error', 'Please upload only png or jpg Design files.');
          return;
        }
      }
      
      Array.from(fileList).forEach(file => this.uploadSingleFile(file, fileType));
    }
  }

  uploadSingleFile(file: File, fileType: string){
    this.dataService.updateProgressBarSubjectForSlider(true);
    this.dataService.postFile('/tasks/'+this.taskId+'/files?file-type='+fileType, file).subscribe({
      next: (response) => {
        this.getFileDetails();
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to Upload File, Please try again.');
      }
    });
  }

  removeFileDetails(fileId: number){
    this.dataService.updateProgressBarSubjectForSlider(true);
    this.dataService.delete('/tasks/'+this.taskId+'/files/'+fileId).subscribe({
      next: (response) => {
        this.getFileDetails();
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to Remove File, Please try again.');
      }
    });
  }
  
  deliver() {

    if((this.fileDetailsDesign.length == 0 || this.fileDetails3dVisualisation.length == 0) && this.taskStatus == 'IP'){
      this.dialogService.openMessageDialog('Error', 'Please upload at least one design and visualisation file.');
      return;
    }

    if((this.fileDetailsCorrectedDesign.length == 0 || this.fileDetailsCorrected3dVisualisation.length == 0) && this.taskStatus == 'IC'){
      this.dialogService.openMessageDialog('Error', 'Please upload at least one Corrected design and visualisation file.');
      return;
    }

    this.dialog.open(ConfirmDialogComponent, { width: '25%', data: { title: 'Confirm Task delivery to Dentist?', lines: ['Case / Patient: ' + this.refNum, 'Task Id: ' + this.taskId] } }).afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.dataService.updateProgressBarSubject(true);
      this.dataService.put('/tasks/' + this.taskId + '/complete', {}).subscribe({
        next: (response) => {
          this.dataService.updateProgressBarSubject(false);
          this.dialogService.openMessageDialog('Task Complete', 'Task delivered to dentist successfully.').subscribe({
            next: () => {
              this.dialogRef.close();
              this.router.navigate(['/task-list/my']);
            }
          });
        },
        error: (err) => {
          this.dialogService.handleError(err, 'Failed to Complete task, Please try again.');
        }
      });
    });
  }
  

}


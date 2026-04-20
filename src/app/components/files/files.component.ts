import { Component, Inject } from '@angular/core';
import { DialogService } from '../../Services/dialog.service';
import { DataService } from '../../Services/data.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface FileDetails {
  fileId: number;
  fileType: string;
  fileName: string;
  fileSize: number;
}

interface FilesDialogData {
  taskId: number;
  refNum: string;
  onDownload?: () => void;   // parent’s saveSection()
}

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [MatCardModule, MatDialogModule, CommonModule, MatButtonModule, FormsModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './files.component.html',
  styleUrl: './files.component.css'
})
export class FilesComponent  {
   
  
  fileDetailsScan: FileDetails[] = [];
  fileDetailsImages: FileDetails[] = [];
  fileDetailsImagesContent: string[] = [];
  fileDetailsOrderForm: FileDetails[] = [];
  fileDetailsDesign: FileDetails[] = [];
  fileDetails3dVisualisation: FileDetails[] = [];
  fileDetailsDesignImages: FileDetails[] = [];
  fileDetailsCorrectedDesign: FileDetails[] = [];

  taskId: number;
  refNum: string;


  constructor( private dialogService: DialogService, public dataService: DataService, private dialogRef: MatDialogRef<FilesComponent>, @Inject(MAT_DIALOG_DATA) public data: any){ 
    this.taskId = data.taskId;
    this.refNum = data.refNum;
  }

  ngOnInit(){
    this.getFileDetails();
   }
   callParentDownload() {
    if (this.data.onDownload) {
      console.log('[FilesComponent] calling parent onDownload');
      this.data.onDownload();
    } else {
      this.dialogService.openMessageDialog('Info', 'Download action is not available.');
    }
  }
   close(){

    this.dialogRef.close({
      fileDetailsScan: this.fileDetailsScan, 
      fileDetailsImages: this.fileDetailsImages, 
      fileDetailsImagesContent: this.fileDetailsImagesContent,
      fileDetailsOrderForm: this.fileDetailsOrderForm, 
      fileDetailsDesign: this.fileDetailsDesign, 
      fileDetailsCorrectedDesign: this.fileDetailsCorrectedDesign
    });

    
    // this.fileCounts.emit({
    //   fileDetailsScan: this.fileDetailsScan, 
    //   fileDetailsImages: this.fileDetailsImages, 
    //   fileDetailsImagesContent: this.fileDetailsImagesContent,
    //   fileDetailsOrderForm: this.fileDetailsOrderForm, 
    //   fileDetailsDesign: this.fileDetailsDesign, 
    //   fileDetailsCorrectedDesign: this.fileDetailsCorrectedDesign
    // });
    // this.showSlider.value = false;
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

  addFileDetails(event: any, fileType: string = ''){
    var fileList: FileList = event.target.files;
    if (fileList.length == 0) {
      this.dialogService.openMessageDialog('Error', 'Select a file to Upload.');
    }else{
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
        if(err.status == 400){
          this.dialogService.openMessageDialog('Error', 'File already exists, please try uploading a different file.');
        }else {
          this.dialogService.openMessageDialog('Error', 'File Size Limit Exceeded.');
        }
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

}

import { Component, ElementRef, Inject, Input, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from '../../Services/data.service';
import { DialogService } from '../../Services/dialog.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { ImageDialogComponent } from './image-dialog/image-dialog/image-dialog.component';
import { MyBoolean } from '../create-task-demo/create-task-demo.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface Comments {
  showOriginal: boolean;
  userId: string;
  comment: string;
  createTime: string;
  imageContents: string;
  alignment: string;
  commentId: number;
  source: string;
}

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatTooltipModule, MatCardModule, MatDialogModule, CommonModule, MatButtonModule, FormsModule, MatIconModule, MatInputModule],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css'
})
export class CommentsComponent {

  @ViewChild('commentDiv') commentDiv!: ElementRef;
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  //use this for slider
  // @Input() showSlider: MyBoolean = { value: false };
  // @Input() taskId!: number;

  //use this for dialog
  taskId: number;
  refNum: string;
  commentId: number;

  comments: Comments[] = [];
  comment: string = '';

  userColors: { [key: string]: string } = {};
  colors: string[] = ['gainsboro', 'lavender', 'lightblue', 'lightgray', 'silver', 'whitesmoke', 'turquoise'];
  toBeTranslated: string = 'Y';

  //use this for dialog
  constructor(private dialogService: DialogService, public dataService: DataService, private dialogRef: MatDialogRef<CommentsComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialog){
    this.taskId = data.taskId;
    this.refNum = data.refNum;
    this.commentId = data.commentId;
  }
 
  // use this for slider
  // constructor(private dialogService: DialogService, public dataService: DataService, private dialog: MatDialog){ }

  autoGrowTextArea(event: Event): void {
    const textArea = event.target as HTMLTextAreaElement;
    textArea.style.height = 'auto';
    textArea.style.height = textArea.scrollHeight + 'px';
  }

  prevTime: Date | undefined;

  isNewDate(createTime: string): boolean{
    const commentDate = new Date(createTime);

    if(!this.prevTime){
      this.prevTime = commentDate;
      return true;
    }else{
      const isNewDate = this.prevTime && commentDate.toDateString() !== this.prevTime.toDateString();
      this.prevTime = commentDate;
      return isNewDate;
    }
  }

  getColorByUser(userId: string): string {
    return this.userColors[userId] || '#C5E2DA';
  }

  private setCommentAlignment(comment: Comments, index: number){
    if(this.dataService.userId == comment.userId){
      comment.alignment = 'right';
    }else{
      comment.alignment = 'left';
    }
  }

  assignColorByUser(): void {
    let colorIndex = 0;
    const userSet = new Set(this.comments.map((comment, index) => {
        this.setCommentAlignment(comment, index);
        return comment.userId;
      }));
      
      userSet.forEach(userId => {
        if(this.dataService.userId == userId){
          this.userColors[userId] = '#C5E2DA';
        }else {
          this.userColors[userId] = '#F9F9F9';
        }
      });
  }


  scrollToBottom(): void {
    const container = this.chatContainer.nativeElement;
    container.scrollTop = container.scrollHeight+10000;
  }

  ngOnInit(){
   this.getComments();
  }

  close(){
    this.dialogRef.close(); // use this for dialog
    // this.showSlider.value = false; // use this for slider
  }

  getWidth(imageContents: string){
    return imageContents == '' || imageContents == undefined ? '302px' : '302px';
  }

  postComment(event: Event){
    if(this.comment == undefined || this.comment == ''){
      this.dialogService.openMessageDialog('Error', 'Please provide some comments to send.');
      return;
    }
    this.uploadImageAndComment(this.comment);
    
    const textArea = event.target as HTMLTextAreaElement;
    textArea.style.height = '24px';
  }

  getComments(){
    this.dataService.updateProgressBarSubjectForSlider(true);
    this.dataService.getDataAsList('/tasks/'+this.taskId+'/comments').subscribe({
      next: (response) => {
        this.comments = response;
       
        this.assignColorByUser();
        this.dataService.updateProgressBarSubjectForSlider(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get Comments for this Task, Please try again.');
        this.close();
      }
    });
  }

  addFileDetails(event: any){
    var fileList: FileList = event.target.files;
    if (fileList.length == 0) {
      this.dialogService.openMessageDialog('Error', 'Select a file to Upload.');
    }else{
      // this.showSlider.value = false;
      this.dialog.open(ImageDialogComponent, { maxWidth: '80vw', height: 'auto', data: {file: fileList[0], preview: false} }).afterClosed().subscribe(result => {
        if(result != ''){
          this.uploadImageAndComment(result, fileList[0]);
        }
        // this.showSlider.value = true;
      });
    }
  }

  previewImage(fileContents: string){
    this.dialog.open(ImageDialogComponent, { maxWidth: '80vw', height: 'auto', data: {imageSrc: 'data:image/*;base64,'+fileContents, preview: true} });
  }

  uploadImageAndComment(comment: string, image?: File | undefined){
    this.dataService.updateProgressBarSubjectForSlider(true);
    const formData: FormData = new FormData();
    
    if(image != undefined){
      formData.append('image', image, image.name);
    }
    
    formData.append('comment', new Blob([comment], { type: 'text/plain' }));
    this.dataService.postMultiPartData('/tasks/'+this.taskId+'/comments', formData).subscribe({
      next: (response) => {
        this.comment = '';
        this.dataService.updateProgressBarSubjectForSlider(false);
        this.getComments();
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to post comment, Please try again.');
      }
    });
  }

  translateComment(comment: Comments) {
    const commentId = Number(comment.commentId);
     const label = comment.showOriginal ? 'Show Original' : 'Translate';
    if(label == 'Show Original'){
     this.toBeTranslated = 'N';

    }
    this.dataService.updateProgressBarSubjectForSlider(true);
  
    this.dataService.getDataAsText(`/tasks/${commentId}/comment/${this.toBeTranslated}`).subscribe({
      next: (translatedText: string) => {
        comment.comment = translatedText; 
        console.log("console.log"+translatedText) // You can store/display this on the comment
        this.dataService.updateProgressBarSubjectForSlider(false);
        comment.showOriginal = !comment.showOriginal;
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to translate comment. Please try again.');
        this.close();
      }
    });
  }
  

}

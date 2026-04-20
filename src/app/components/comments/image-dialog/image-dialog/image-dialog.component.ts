import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-image-dialog',
  standalone: true,
  imports: [MatInputModule, MatDialogModule, MatCardModule, MatIconModule, MatButtonModule, FormsModule, CommonModule],
  templateUrl: './image-dialog.component.html',
  styleUrl: './image-dialog.component.css'
})
export class ImageDialogComponent {

  imageSrc: string | ArrayBuffer | null = null;
  comment: string = '';

  constructor(public dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) public data: any) {
    if(data.imageSrc != '' && data.imageSrc != undefined){
      this.imageSrc = data.imageSrc;
    }else{
      const reader = new FileReader();
      reader.onload = () => this.imageSrc = reader.result;
      reader.readAsDataURL(data.file);
    }
  }

  postImageAndComment(): void {
    this.dialogRef.close(this.comment);
  }

  close(): void {
    this.dialogRef.close('');
  }
  
}

import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'

@Component({
  selector: 'app-message-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './message-dialog.component.html',
  styleUrl: './message-dialog.component.css'
})
export class MessageDialogComponent {
  data: any;

  constructor(private dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) private content: any){
    this.data = content;
  }

  close(): void{
    this.dialogRef.close();
  }

}
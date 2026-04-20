import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { DataService } from '../../../Services/data.service';
import { DialogService } from '../../../Services/dialog.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { OptionsDialogComponent } from '../../dialogs/options-dialog/options-dialog.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-feedback-dialog',
  standalone: true,
  imports: [MatDialogModule, MatSelectModule, FormsModule, CommonModule, MatButtonModule, MatInputModule],
  templateUrl: './feedback-dialog.component.html',
  styleUrl: './feedback-dialog.component.css'
})
export class FeedbackDialogComponent {

  selectedOption: string = '';
  comment: string = '';

  constructor(private dataService: DataService, private dialogService: DialogService, public dialogRef: MatDialogRef<OptionsDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submitFeedback(): void {
    this.dataService.updateProgressBarSubject(true);
    this.dataService.put('/tasks/'+this.data.taskId+'/feedback', {feedbackId: this.selectedOption, comment: this.comment}).subscribe({
      next: (response) => {
        this.dataService.updateProgressBarSubject(false);
        this.dialogService.openMessageDialog('Info', 'Saved the Feedback successfully.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to save Feedback, Please try again.');
      }
    });
  }

}

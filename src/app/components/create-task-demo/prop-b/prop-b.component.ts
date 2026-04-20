import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import {MatRadioModule} from '@angular/material/radio';
import {FormsModule} from '@angular/forms';
import { DialogData } from '../../dialogs/options-dialog/options-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-prop-b',
  standalone: true,
  imports: [MatDialogModule, CommonModule, MatListModule, MatButtonModule, MatRadioModule, FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './prop-b.component.html',
  styleUrl: './prop-b.component.css'
})
export class PropBComponent {

  q1Value: string;

  constructor(public dialogRef: MatDialogRef<PropBComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.q1Value = data.q1Value;
  }

  confirm(): void {
    this.dialogRef.close([{ques: 'Anatomical equator for the oral surface', ans: this.q1Value}]);
  }

  cancel(): void {
    this.dialogRef.close([]);
  }

}

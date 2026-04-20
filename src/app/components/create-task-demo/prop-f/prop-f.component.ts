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
  selector: 'app-prop-f',
  standalone: true,
  imports: [MatDialogModule, CommonModule, MatListModule, MatButtonModule, MatRadioModule, FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './prop-f.component.html',
  styleUrl: './prop-f.component.css'
})
export class PropFComponent {

  q1Value: string;
  q2Value: string;

  constructor(public dialogRef: MatDialogRef<PropFComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.q1Value = data.q1Value;
    this.q2Value = data.q2Value;
  }

  confirm(): void {
    this.dialogRef.close([{ques: 'Fissure depth', ans: this.q1Value}, {ques: 'Crown wear', ans: this.q2Value}]);
  }

  cancel(): void {
    this.dialogRef.close([]);
  }

}

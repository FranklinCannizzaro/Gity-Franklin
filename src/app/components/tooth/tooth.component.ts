import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-tooth',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule, MatIcon, MatButtonModule],
  templateUrl: './tooth.component.html',
  styleUrl: './tooth.component.css'
})
export class ToothComponent {

  selectedTeeth: string[] = [];
  items: string[] = ['Coping / Copping-Bridge', 'Crown / Bridge', 'Inlay/onlay', 'Abutment', 'RPD/CPD', 'Telescope', 'Night Guard', 'screw R.', 'Cutback/Cutback Bridge', 'Coping/Crown'];
  selectedItem: string = '';

  constructor(private dialogRef: MatDialogRef<ToothComponent>){}
 
  close(){
    this.dialogRef.close();
  }

  add(){
    // this.dialogRef.close(this.selectedTeeth);
    this.dialogRef.close({ 'procedureType': this.selectedItem, 'teethList': this.selectedTeeth });
  }

  onToothClick(toothId: string): void {
    const index = this.selectedTeeth.indexOf(toothId);
    if (index === -1) {
      this.selectedTeeth.push(toothId); // Add tooth if not selected
    } else {
      this.selectedTeeth.splice(index, 1); // Remove tooth if already selected
    }
  }

  getToothColor(toothId: string): string {
    return this.selectedTeeth.includes(toothId) ? 'lightblue' : 'lightgray';
  }

}
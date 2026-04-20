import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { DialogData } from '../../dialogs/options-dialog/options-dialog.component';
import { MatInputModule } from '@angular/material/input';
import { MyBoolean, OrderDetails, OrderDetailsNew } from '../create-task-demo.component';

@Component({
  selector: 'app-bite-type',
  standalone: true,
  imports: [MatDialogModule, CommonModule, MatButtonModule, MatRadioModule, FormsModule, MatInputModule],
  templateUrl: './bite-type.component.html',
  styleUrl: './bite-type.component.css'
})
export class BiteTypeComponent {
  @Input() orderDetailsNew!: OrderDetailsNew;
  @Input() showSlider!: MyBoolean;

  constructor() {}

  biteTypes: string[] = ['overbite', 'underbite', 'excessive-spacing', 'deep-bite', 'crossbite', 'crowding', 'open-bite'];

  biteTypeHoveredMap: Map<string, boolean> = new Map<string, boolean>();

  isHovered = false;

  onMouseOver(biteType: string) {
    this.biteTypeHoveredMap.set(biteType, true);
    // this.isHovered = true;
  }

  onMouseOut(biteType: string) {
    this.biteTypeHoveredMap.set(biteType, false);
    // this.isHovered = false;
  }

  changeBiteType(biteType: string): void {
    this.orderDetailsNew.biteType = biteType;
    this.showSlider.value = false;
  }

  cancel(): void {
    this.orderDetailsNew.biteType = 'normal bite';
    this.showSlider.value = false;
  }

}

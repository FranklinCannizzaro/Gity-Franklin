import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { DialogData } from '../../dialogs/options-dialog/options-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MyBoolean, OrderDetails, OrderDetailsNew } from '../create-task-demo.component';
import { MatSliderModule } from '@angular/material/slider';
@Component({
  selector: 'app-articulation',
  standalone: true,
  imports: [MatSliderModule, MatDialogModule, CommonModule, MatListModule, MatButtonModule, MatRadioModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './articulation.component.html',
  styleUrl: './articulation.component.css'
})
export class ArticulationComponent {
  @Input() showSlider!: MyBoolean;
  @Input() orderDetailsNew!: OrderDetailsNew;

  @Input() protrusionAngle!: number;
  @Input() bennettAngle!: number;
  @Input() iss!: number;
  @Input() incisalGuidance!: number;
  @Input() q2Value!: number;

 

  articulatorDefault: string = 'Artex von Amann Girrbach';
  protrusionAngleDefault: number = 30;
  bennettAngleDefault: number = 15;
  issDefault: number = 0.5;
  incisalGuidanceDefault: number = 10;
  q2ValueDefault: number = -0.2


  protrusionAngleRange: any = {
    'Artex von Amann Girrbach': [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
    'SAM': [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
    'KaVo PROTAR evo': [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
    'Whip Mix DENAR Mark 330': [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60]
  }

  bennettAngleRange: any = {
    'Artex von Amann Girrbach': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    'SAM': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
    'KaVo PROTAR evo': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    'Whip Mix DENAR Mark 330': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
  }

  issRange: any = {
    'Artex von Amann Girrbach': [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2],
    'SAM': [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2],
    'KaVo PROTAR evo': [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3],
    'Whip Mix DENAR Mark 330': [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.1, 2.2, 2.3, 2.4, 2.5]
  }

  incisalGuidanceRange: any = {
    'Artex von Amann Girrbach': [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    'SAM': [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
    'KaVo PROTAR evo': [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
    'Whip Mix DENAR Mark 330': [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
  }



  errMsg: string | null = null;

  constructor() {}

  confirm(): void {
    this.orderDetailsNew.articulationDetails.props['Protrusion Angle'] = this.protrusionAngleDefault.toString();
    this.orderDetailsNew.articulationDetails.props['Bennett Angle'] = this.bennettAngleDefault.toString();
    this.orderDetailsNew.articulationDetails.props['Immediate Side Shift (ISS)'] = this.issDefault.toString();
    this.orderDetailsNew.articulationDetails.props['Incisal Guidance'] = this.incisalGuidanceDefault.toString();
    this.orderDetailsNew.articulationDetails.props['Raising or lowering the articulator'] = this.q2ValueDefault.toString();

    this.showSlider.value = false;
  }

  cancel(): void {
    this.showSlider.value = false;
  }

  validate(){
    this.errMsg = null;

    if (isNaN(this.q2Value)) {
      this.errMsg = 'Invalid Value';
    }

    if (this.q2Value < -50.0 || this.q2Value > 50.0) {
      this.errMsg = 'Value out of range, should be between -50 mm to +50 mm';
    }

    const incrementValid = (this.q2Value * 100) % 1 === 0;
    if (!incrementValid) {
      this.errMsg = 'Invalid value, should be in increments of 0.01 mm';
    }
  }

}

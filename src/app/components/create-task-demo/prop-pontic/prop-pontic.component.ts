import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import {MatRadioModule} from '@angular/material/radio';
import {FormsModule} from '@angular/forms';
import { DialogData } from '../../dialogs/options-dialog/options-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MyBoolean, OrderDetails, OrderDetailsNew, ToothData } from '../create-task-demo.component';
import { MatSliderModule } from '@angular/material/slider';
import { DataService } from '../../../Services/data.service';


@Component({
  selector: 'app-prop-pontic',
  standalone: true,
  imports: [MatSliderModule, MatDialogModule, CommonModule, MatListModule, MatButtonModule, MatRadioModule, FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './prop-pontic.component.html',
  styleUrls: ['./prop-pontic.component.css', '../../../../style-custom.css'],
})
export class PropPonticComponent {

  q1Options: string[] = [
    "-0.60 mm: Very strongly penetrating into the gingiva", "-0.59 mm", "-0.58 mm", "-0.57 mm", "-0.56 mm", "-0.55 mm", "-0.54 mm", "-0.53 mm", "-0.52 mm", "-0.51 mm",
    "-0.50 mm", "-0.49 mm", "-0.48 mm", "-0.47 mm", "-0.46 mm", "-0.45 mm", "-0.44 mm", "-0.43 mm", "-0.42 mm", "-0.41 mm",
    "-0.40 mm", "-0.39 mm", "-0.38 mm", "-0.37 mm", "-0.36 mm", "-0.35 mm", "-0.34 mm", "-0.33 mm", "-0.32 mm", "-0.31 mm",
    "-0.30 mm", "-0.29 mm", "-0.28 mm", "-0.27 mm", "-0.26 mm", "-0.25 mm", "-0.24 mm", "-0.23 mm", "-0.22 mm", "-0.21 mm",
    "-0.20 mm", "-0.19 mm", "-0.18 mm", "-0.17 mm", "-0.16 mm", "-0.15 mm", "-0.14 mm", "-0.13 mm", "-0.12 mm", "-0.11 mm",
    "-0.10 mm: Strongly penetrating into the gingiva", "-0.09 mm", "-0.08 mm", "-0.07 mm", "-0.06 mm", "-0.05 mm", "-0.04 mm", "-0.03 mm: Lightly penetrating into the gingiva", "-0.02 mm", "-0.01 mm",
     "0.0 mm: Resting on the gingiva", "0.01 mm: Lightly resting on the gingiva", "0.02 mm: Lightly protruding from the gingiva", "0.03 mm", "0.04 mm", "0.05 mm: Lightly protruding from the gingiva", "0.06 mm", "0.07 mm", "0.08 mm", "0.09 mm",
     "0.10 mm: Strongly protruding from the gingiva", "0.11 mm", "0.12 mm", "0.13 mm", "0.14 mm", "0.15 mm", "0.16 mm", "0.17 mm", "0.18 mm", "0.19 mm",
     "0.20 mm", "0.21 mm", "0.22 mm", "0.23 mm", "0.24 mm", "0.25 mm", "0.26 mm", "0.27 mm", "0.28 mm", "0.29 mm",
     "0.30 mm", "0.31 mm", "0.32 mm", "0.33 mm", "0.34 mm", "0.35 mm", "0.36 mm", "0.37 mm", "0.38 mm", "0.39 mm",
     "0.40 mm", "0.41 mm", "0.42 mm", "0.43 mm", "0.44 mm", "0.45 mm", "0.46 mm", "0.47 mm", "0.48 mm", "0.49 mm",
     "0.50 mm: Very strongly protruding from the gingiva", "0.51 mm", "0.52 mm", "0.53 mm", "0.54 mm", "0.55 mm", "0.56 mm", "0.57 mm", "0.58 mm", "0.59 mm",
     "0.60 mm", "0.61 mm", "0.62 mm", "0.63 mm", "0.64 mm", "0.65 mm", "0.66 mm", "0.67 mm", "0.68 mm", "0.69 mm",
     "0.70 mm", "0.71 mm", "0.72 mm", "0.73 mm", "0.74 mm", "0.75 mm", "0.76 mm", "0.77 mm", "0.78 mm", "0.79 mm",
     "0.80 mm", "0.81 mm", "0.82 mm", "0.83 mm", "0.84 mm", "0.85 mm", "0.86 mm", "0.87 mm", "0.88 mm", "0.89 mm",
     "0.90 mm", "0.91 mm", "0.92 mm", "0.93 mm", "0.94 mm", "0.95 mm", "0.96 mm", "0.97 mm", "0.98 mm", "0.99 mm",
     "1.00 mm", "1.01 mm", "1.02 mm", "1.03 mm", "1.04 mm", "1.05 mm", "1.06 mm", "1.07 mm", "1.08 mm", "1.09 mm",
     "1.10 mm", "1.11 mm", "1.12 mm", "1.13 mm", "1.14 mm", "1.15 mm", "1.16 mm", "1.17 mm", "1.18 mm", "1.19 mm",
     "1.20 mm", "1.21 mm", "1.22 mm", "1.23 mm", "1.24 mm", "1.25 mm", "1.26 mm", "1.27 mm", "1.28 mm", "1.29 mm",
     "1.30 mm", "1.31 mm", "1.32 mm", "1.33 mm", "1.34 mm", "1.35 mm", "1.36 mm", "1.37 mm", "1.38 mm", "1.39 mm",
     "1.40 mm", "1.41 mm", "1.42 mm", "1.43 mm", "1.44 mm", "1.45 mm", "1.46 mm", "1.47 mm", "1.48 mm", "1.49 mm",
     "1.50 mm", "1.51 mm", "1.52 mm", "1.53 mm", "1.54 mm", "1.55 mm", "1.56 mm", "1.57 mm", "1.58 mm", "1.59 mm",
     "1.60 mm", "1.61 mm", "1.62 mm", "1.63 mm", "1.64 mm", "1.65 mm", "1.66 mm", "1.67 mm", "1.68 mm", "1.69 mm",
     "1.70 mm", "1.71 mm", "1.72 mm", "1.73 mm", "1.74 mm", "1.75 mm", "1.76 mm", "1.77 mm", "1.78 mm", "1.79 mm",
     "1.80 mm", "1.81 mm", "1.82 mm", "1.83 mm", "1.84 mm", "1.85 mm", "1.86 mm", "1.87 mm", "1.88 mm", "1.89 mm",
     "1.90 mm", "1.91 mm", "1.92 mm", "1.93 mm", "1.94 mm", "1.95 mm", "1.96 mm", "1.97 mm", "1.98 mm", "1.99 mm",
     "2.00 mm", "2.01 mm", "2.02 mm", "2.03 mm", "2.04 mm", "2.05 mm", "2.06 mm", "2.07 mm", "2.08 mm", "2.09 mm",
     "2.10 mm", "2.11 mm", "2.12 mm", "2.13 mm", "2.14 mm", "2.15 mm", "2.16 mm", "2.17 mm", "2.18 mm", "2.19 mm",
     "2.20 mm", "2.21 mm", "2.22 mm", "2.23 mm", "2.24 mm", "2.25 mm", "2.26 mm", "2.27 mm", "2.28 mm", "2.29 mm",
     "2.30 mm", "2.31 mm", "2.32 mm", "2.33 mm", "2.34 mm", "2.35 mm", "2.36 mm", "2.37 mm", "2.38 mm", "2.39 mm",
     "2.40 mm", "2.41 mm", "2.42 mm", "2.43 mm", "2.44 mm", "2.45 mm", "2.46 mm", "2.47 mm", "2.48 mm", "2.49 mm",
     "2.50 mm", "2.51 mm", "2.52 mm", "2.53 mm", "2.54 mm", "2.55 mm", "2.56 mm", "2.57 mm", "2.58 mm", "2.59 mm",
     "2.60 mm", "2.61 mm", "2.62 mm", "2.63 mm", "2.64 mm", "2.65 mm", "2.66 mm", "2.67 mm", "2.68 mm", "2.69 mm",
     "2.70 mm", "2.71 mm", "2.72 mm", "2.73 mm", "2.74 mm", "2.75 mm", "2.76 mm", "2.77 mm", "2.78 mm", "2.79 mm",
     "2.80 mm", "2.81 mm", "2.82 mm", "2.83 mm", "2.84 mm", "2.85 mm", "2.86 mm", "2.87 mm", "2.88 mm", "2.89 mm",
     "2.90 mm", "2.91 mm", "2.92 mm", "2.93 mm", "2.94 mm", "2.95 mm", "2.96 mm", "2.97 mm", "2.98 mm", "2.99 mm",
     "3.00 mm", "3.01 mm", "3.02 mm", "3.03 mm", "3.04 mm", "3.05 mm", "3.06 mm", "3.07 mm", "3.08 mm", "3.09 mm",
     "3.10 mm", "3.11 mm", "3.12 mm", "3.13 mm", "3.14 mm", "3.15 mm", "3.16 mm", "3.17 mm", "3.18 mm", "3.19 mm",
     "3.20 mm", "3.21 mm", "3.22 mm", "3.23 mm", "3.24 mm", "3.25 mm", "3.26 mm", "3.27 mm", "3.28 mm", "3.29 mm",
     "3.30 mm", "3.31 mm", "3.32 mm", "3.33 mm", "3.34 mm", "3.35 mm", "3.36 mm", "3.37 mm", "3.38 mm", "3.39 mm",
     "3.40 mm", "3.41 mm", "3.42 mm", "3.43 mm", "3.44 mm", "3.45 mm", "3.46 mm", "3.47 mm", "3.48 mm", "3.49 mm",
     "3.50 mm", "3.51 mm", "3.52 mm", "3.53 mm", "3.54 mm", "3.55 mm", "3.56 mm", "3.57 mm", "3.58 mm", "3.59 mm",
     "3.60 mm", "3.61 mm", "3.62 mm", "3.63 mm", "3.64 mm", "3.65 mm", "3.66 mm", "3.67 mm", "3.68 mm", "3.69 mm",
     "3.70 mm", "3.71 mm", "3.72 mm", "3.73 mm", "3.74 mm", "3.75 mm", "3.76 mm", "3.77 mm", "3.78 mm", "3.79 mm",
     "3.80 mm", "3.81 mm", "3.82 mm", "3.83 mm", "3.84 mm", "3.85 mm", "3.86 mm", "3.87 mm", "3.88 mm", "3.89 mm",
     "3.90 mm", "3.91 mm", "3.92 mm", "3.93 mm", "3.94 mm", "3.95 mm", "3.96 mm", "3.97 mm", "3.98 mm", "3.99 mm",
     "4.00 mm", "4.01 mm", "4.02 mm", "4.03 mm", "4.04 mm", "4.05 mm", "4.06 mm", "4.07 mm", "4.08 mm", "4.09 mm",
     "4.10 mm", "4.11 mm", "4.12 mm", "4.13 mm", "4.14 mm", "4.15 mm", "4.16 mm", "4.17 mm", "4.18 mm", "4.19 mm",
     "4.20 mm", "4.21 mm", "4.22 mm", "4.23 mm", "4.24 mm", "4.25 mm", "4.26 mm", "4.27 mm", "4.28 mm", "4.29 mm",
     "4.30 mm", "4.31 mm", "4.32 mm", "4.33 mm", "4.34 mm", "4.35 mm", "4.36 mm", "4.37 mm", "4.38 mm", "4.39 mm",
     "4.40 mm", "4.41 mm", "4.42 mm", "4.43 mm", "4.44 mm", "4.45 mm", "4.46 mm", "4.47 mm", "4.48 mm", "4.49 mm",
     "4.50 mm", "4.51 mm", "4.52 mm", "4.53 mm", "4.54 mm", "4.55 mm", "4.56 mm", "4.57 mm", "4.58 mm", "4.59 mm",
     "4.60 mm", "4.61 mm", "4.62 mm", "4.63 mm", "4.64 mm", "4.65 mm", "4.66 mm", "4.67 mm", "4.68 mm", "4.69 mm",
     "4.70 mm", "4.71 mm", "4.72 mm", "4.73 mm", "4.74 mm", "4.75 mm", "4.76 mm", "4.77 mm", "4.78 mm", "4.79 mm",
     "4.80 mm", "4.81 mm", "4.82 mm", "4.83 mm", "4.84 mm", "4.85 mm", "4.86 mm", "4.87 mm", "4.88 mm", "4.89 mm",
     "4.90 mm", "4.91 mm", "4.92 mm", "4.93 mm", "4.94 mm", "4.95 mm", "4.96 mm", "4.97 mm", "4.98 mm", "4.99 mm",
     "5.00 mm: Floating component (Schwebeglied)"
  ];

  @Input() orderDetailsNew!: OrderDetailsNew;
  @Input() showSlider: MyBoolean | undefined;
  @Input() readonly: boolean = false;
  @Input() anterior!: boolean;
  @Input() teeth!: number[];

  frontPonticDefaultValue: string = 'sattel-a';
  frontPonticStrengthDefaultValue: number = .03;
  sidePonticDefaultValue: string = 'Tangential';
  sidePonticStrengthDefaultValue: number = .03;

  constructor(public dataService: DataService) {
  }

  ngOnInit() {
    this.orderDetailsNew.props['pontic-Pontic design-front'] = this.orderDetailsNew.props['pontic-Pontic design-front'] ? this.orderDetailsNew.props['pontic-Pontic design-front'] : this.frontPonticDefaultValue;
    this.orderDetailsNew.props['pontic-Contact Strength-front'] = this.orderDetailsNew.props['pontic-Contact Strength-front'] ? this.orderDetailsNew.props['pontic-Contact Strength-front'] : this.frontPonticStrengthDefaultValue;
    this.orderDetailsNew.props['pontic-Pontic design-side'] = this.orderDetailsNew.props['pontic-Pontic design-side'] ? this.orderDetailsNew.props['pontic-Pontic design-side'] : this.sidePonticDefaultValue;
    this.orderDetailsNew.props['pontic-Contact Strength-side'] = this.orderDetailsNew.props['pontic-Contact Strength-side'] ? this.orderDetailsNew.props['pontic-Contact Strength-side'] : this.sidePonticStrengthDefaultValue;
  }

  close(): void {
    if(this.showSlider){
      this.showSlider.value = false;
    }
  }

}
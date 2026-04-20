import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MyBoolean, OrderDetails } from '../create-task-demo.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-prop-v',
  standalone: true,
  imports: [MatCheckboxModule, MatDialogModule, CommonModule, MatListModule, MatButtonModule, MatRadioModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './prop-v.component.html',
  styleUrl: './prop-v.component.css'
})
export class PropVComponent {

  @Input() orderDetails!: OrderDetails;
  @Input() showSlider: MyBoolean | undefined;

  // @Input() medianValue!: number;
  // @Input() mesialValue!: number;
  // @Input() q1Value!: string;

  // @Input() teeth: Set<number> = new Set<number>();

  // teethSelectionMap: Map<number, boolean> = new Map<number, boolean>();

  // ngOnInit() {
  //   this.teeth.forEach(tooth => {
  //     this.teethSelectionMap.set(tooth, true);
  //   });
  // }

  // updateTeethSelectionMap(tooth: number, checked: boolean): void {
  //   this.teethSelectionMap.set(tooth, checked);
  // }
  
  medianValueDefault: number = 129;
  mesialValueDefault: number = 0;
  q1ValueDefault: string = 'default buccal/labial convexity';

  medianValue: number = this.medianValueDefault;
  mesialValue: number = this.mesialValueDefault;
  q1Value: string = this.q1ValueDefault;


  glaze: string = '0.2 mm';

  get rotationTransformForMedian(): string {
    return `rotate(${(90-this.medianValue)/2},140,120)`;
  }

  get rotationTransformForMesial(): string {
    return `rotate(${this.mesialValue},110,190)`;
  }

  validateInputForMedian(event: any) {
    var medianVal = event.target.value;
    if (medianVal < 107) {
      this.medianValue = 107;
    } else if (medianVal > 151) {
      this.medianValue = 151;
    }
    
    if (medianVal % 1 !== 0) {
      this.medianValue = Math.floor(medianVal);
    }
  }

  
  

  constructor() {
  }

  confirm(): void {
    if(this.medianValueDefault != this.medianValue){
      console.log('medianValueDefault: ', this.medianValueDefault);
      this.orderDetails.toothData
      // .filter(tooth => tooth.teeth == this.teeth)
      .forEach(tooth => tooth.props['Median inclination angle'] = this.medianValue.toString());
    }
    if(this.mesialValueDefault != this.mesialValue){
      this.orderDetails.toothData
      // .filter(tooth => tooth.teeth == this.teeth)
      .forEach(tooth => tooth.props['Mesial distal rotation'] = this.mesialValue.toString());
    }
    if(this.q1ValueDefault != this.q1Value){
      this.orderDetails.toothData
      // .filter(tooth => tooth.teeth == this.teeth)
      .forEach(tooth => tooth.props['buccal/labial convexity'] = this.q1Value);
    }

    this.close();
  }

  close(): void {
    if(this.showSlider){
      this.showSlider.value = false;
    }
  }

}

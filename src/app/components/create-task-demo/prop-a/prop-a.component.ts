import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, Input, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import {MatRadioModule} from '@angular/material/radio';
import {FormsModule} from '@angular/forms';
import { DialogData } from '../../dialogs/options-dialog/options-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MyBoolean, OrderDetails, OrderDetailsNew, ToothData } from '../create-task-demo.component';
import { MatSliderModule } from '@angular/material/slider';
import { DataService } from '../../../Services/data.service';
import { MagnifierComponent } from '../../magnifier/magnifier.component';

@Component({
  selector: 'app-prop-a',
  standalone: true,
  imports: [MatSliderModule, MatDialogModule, CommonModule, MatListModule, MatButtonModule, MatRadioModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MagnifierComponent],
  templateUrl: './prop-a.component.html',
  styleUrls: ['./prop-a.component.css', '../../../../style-custom.css'],
})
export class PropAComponent {

  @Input() orderDetailsNew!: OrderDetailsNew;
  @Input() showSlider: MyBoolean | undefined;
  @Input() readonly: boolean = false;
  @Input() anterior!: boolean;
  @Input() teeth!: number[];
  
  q1DefaultValue: string = '1/3 of the surface';
  q2DefaultValue: string = '0.03 mm light occlusion (standard)';
  // q3DefaultValue: string = 'Buccal light equator, approx. 1.6 mm distance cervical (Standard)';

  constructor(public dataService: DataService) { }

  ngOnInit() {
    if(this.orderDetailsNew){
      this.orderDetailsNew.props['a-Mesial and distal contact point-'+this.anterior] = this.orderDetailsNew.props['a-Mesial and distal contact point-'+this.anterior] ? this.orderDetailsNew.props['a-Mesial and distal contact point-'+this.anterior] : this.q1DefaultValue;
      this.orderDetailsNew.props['a-Occlusal contact-'+this.anterior] = this.orderDetailsNew.props['a-Occlusal contact-'+this.anterior] ? this.orderDetailsNew.props['a-Occlusal contact-'+this.anterior] : this.q2DefaultValue;
    }
  }

  rearrangedTeethOrderIgnoringBridgedTeeth(teeth: number[]): string {
    var bridgedTeethNotStartEnd = this.orderDetailsNew.bridges.map((bridge) => {
      return bridge.bridgedTeeth.filter((tooth) => tooth !== bridge.start && tooth !== bridge.end);
    }).flat();

    return this.dataService.rearrangedTeethOrder(teeth.filter((tooth) => tooth != 18 && tooth != 28 && tooth != 48 && tooth != 38 && !bridgedTeethNotStartEnd.includes(tooth)));
  }
 
  close(): void {
    if(this.showSlider){
      this.showSlider.value = false;
    }
  }

}

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
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MyBoolean, OrderDetails, OrderDetailsNew, ToothData } from '../create-task-demo.component';
import { DataService } from '../../../Services/data.service';

@Component({
  selector: 'app-prop-h',
  standalone: true,
  imports: [MatSliderModule, MatDialogModule, CommonModule, MatListModule, MatButtonModule, MatRadioModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './prop-h.component.html',
  styleUrls: ['./prop-h.component.css', '../../../../style-custom.css'],
})
export class PropHComponent {

  @Input() orderDetailsNew!: OrderDetailsNew;
  @Input() showSlider: MyBoolean | undefined;
  @Input() readonly: boolean = false;
  
  q1DefaultValue: number = 0.02;

  constructor(public dataService: DataService) {
  }

  get getContactDescription(): string {
    const value = this.orderDetailsNew.props['h-Occlusion contact'];
    if (value >= -0.20 && value <= -0.01) {
      return 'Very strong contact';
    } else if (value >= 0 && value <= 0.01) {
      return 'Strong contact';
    } else if (value >= 0.02 && value <= 0.05) {
      return 'Light contact (default value)';
    } else if (value >= 0.06 && value <= 0.09) {
      return 'Very light contact';
    } else if (value >= 0.10 && value <= 1) {
      return 'Very far out of contact';
    } else {
      return '';
    }
  }

  ngOnInit() {
    if(this.orderDetailsNew){
      this.orderDetailsNew.props['h-Occlusion contact'] = this.orderDetailsNew.props['h-Occlusion contact'] ? this.orderDetailsNew.props['h-Occlusion contact'] : this.q1DefaultValue;
    }
  }

  close(): void {
    if(this.showSlider){
      this.showSlider.value = false;
    }
  }

}

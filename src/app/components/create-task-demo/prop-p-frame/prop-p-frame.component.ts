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
import { MyBoolean, OrderDetails, OrderDetailsNew, ToothData } from '../create-task-demo.component';
import { DataService } from '../../../Services/data.service';
import { MagnifierComponent } from '../../magnifier/magnifier.component';

@Component({
  selector: 'app-prop-p-frame',
  standalone: true,
  imports: [MatDialogModule, CommonModule, MatListModule, MatButtonModule, MatRadioModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MagnifierComponent],
  templateUrl: './prop-p-frame.component.html',
  styleUrls: ['./prop-p-frame.component.css', '../../../../style-custom.css'],
})
export class PropPFrameComponent {

  @Input() orderDetailsNew!: OrderDetailsNew;
  @Input() showSlider: MyBoolean | undefined;
  @Input() readonly: boolean = false;
  @Input() anterior!: boolean;
  @Input() teeth!: number[];

  q1DefaultValue: string = 'Partially Open Papilla';

  q1Value: string = this.q1DefaultValue;

  constructor(public dataService: DataService) {}

  ngOnInit() {
    if(this.orderDetailsNew){
      this.orderDetailsNew.props['p-Interdental papilla-front'] = this.orderDetailsNew.props['p-Interdental papilla-front'] ? this.orderDetailsNew.props['p-Interdental papilla-front'] : this.q1DefaultValue;
      this.orderDetailsNew.props['p-Interdental papilla-side'] = this.orderDetailsNew.props['p-Interdental papilla-side'] ? this.orderDetailsNew.props['p-Interdental papilla-side'] : this.q1DefaultValue;
    }
  }

  close(): void {
    if(this.showSlider){
      this.showSlider.value = false;
    }
  }

}

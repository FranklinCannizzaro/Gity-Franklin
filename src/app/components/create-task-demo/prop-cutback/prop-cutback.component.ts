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
  selector: 'app-prop-cutback',
  standalone: true,
  imports: [MatSliderModule, MatDialogModule, CommonModule, MatListModule, MatButtonModule, MatRadioModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MagnifierComponent],
  templateUrl: './prop-cutback.component.html',
  styleUrls: ['./prop-cutback.component.css', '../../../../style-custom.css']
})
export class PropCutbackComponent {

      @Input() orderDetailsNew!: OrderDetailsNew;
      @Input() showSlider: MyBoolean | undefined;
      @Input() readonly: boolean = false;
      @Input() anterior!: boolean;
      teeth!: number[];
      
      q1DefaultValue: string = 'cutback-1';
    
      constructor(public dataService: DataService) { }
    
      ngOnInit() {
        if(this.orderDetailsNew){
          this.orderDetailsNew.props['cutback'] = this.orderDetailsNew.props['cutback'] ? this.orderDetailsNew.props['cutback'] : this.q1DefaultValue;
          this.teeth = this.orderDetailsNew!.toothData.filter(data => data.selected).map(data => data.teeth)
        }
      }
    
      rearrangedTeethOrderIgnoringBridgedTeeth(teeth: number[]): string {
        return this.dataService.rearrangedTeethOrder(teeth);
      }
     
      close(): void {
        if(this.showSlider){
          this.showSlider.value = false;
        }
      }

}

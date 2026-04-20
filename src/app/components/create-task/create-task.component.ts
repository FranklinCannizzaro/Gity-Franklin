
import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field'; // Import MatFormFieldModule
import { MatInputModule } from '@angular/material/input'; 
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DataService } from '../../Services/data.service';
import { DialogService } from '../../Services/dialog.service';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { FilesComponent } from '../files/files.component';


@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [MatListModule, MatMenuModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatInputModule, FormsModule, MatIconModule, MatSelectModule, CommonModule, MatButtonModule],
  templateUrl: './create-task.component.html',
  styleUrl: './create-task.component.css'
})
export class CreateTaskComponent {
 
  types: string[] = ['Coping / Copping-Bridge', 'Crown / Bridge', 'Inlay/onlay', 'Abutment', 'RPD/CPD', 'Telescope', 'Night Guard', 'screw R.', 'Cutback/Cutback Bridge', 'Coping/Crown'];

  taskId: number = 0;
 
  refNum: string = '';
  instructions: string = '';

  toothTypeMap: Map<number, string> = new Map();
  selectedTeeth: number[] = [];
  summary: Map<string, number[]> = new Map();
  scanFilesCount: number = 0;

  constructor(private dialog: MatDialog, private dataService: DataService, private dialogService: DialogService, private location: Location){}

  ngOnInit(){
    this.dataService.updateTitle('Create New Task');
    this.dataService.updateProgressBarSubject(true);
    this.dataService.post('/tasks', {}).subscribe({
      next: (response) => {
        this.taskId = response.taskId;
        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to Create a New Task, Please try again.').subscribe(result => this.location.back());
      }
    });
  }


  onTypeChange(type: any){
    var updatedCount = Array.from(this.toothTypeMap).filter(entry => entry[1] == '').map(entry => this.toothTypeMap.set(entry[0], type)).length;
    if(updatedCount == 0){
      this.dialogService.openMessageDialog('Info', 'Select a tooth first.');
    }else{
      this.updateSummary();
    }
  }

  isTypeSelected(type: string): boolean {
    return Array.from(this.toothTypeMap.values()).indexOf(type) > -1;
  }

  updateSummary() {
    this.summary = new Map();
    Array.from(this.toothTypeMap).filter(([tooth, type]) => type != '').forEach(([tooth, type]) => {
      const toothList = this.summary.get(type) || [];
      toothList.push(tooth);
      this.summary.set(type, toothList);
    });
  }

  combineToothNumbers(input: number[]): string {
    return this.dataService.combineToothNumbers(input);
  }
  
  onToothClick(toothIdStr: string): void {
    var toothId = Number(toothIdStr);
    const index = this.selectedTeeth.indexOf(toothId);
    if (index === -1) {
      this.selectedTeeth.push(toothId); // Add tooth if not selected
      this.toothTypeMap.set(toothId, '');
    } else {
      this.selectedTeeth.splice(index, 1); // Remove tooth if already selected
      this.toothTypeMap.delete(toothId);
      this.updateSummary();
    }
  }

  getToothColor(toothIdStr: string): string {
    var toothId = Number(toothIdStr);
    return this.selectedTeeth.includes(toothId) ? 'lightblue' : 'lightgray';
  }

  saveTask(){
    var errorMessage = '';
    if(this.refNum == ''){
      errorMessage += 'Case / Patient details are missing, ';
    }
    if(this.instructions == ''){
      errorMessage += 'Instructions are missing, ';
    }
    if(this.scanFilesCount == 0){
      errorMessage += 'Upload atleast one Scan file to proceed, ';
    }
    if(this.summary.size == 0){
      errorMessage += 'Select Teeth and Type to Proceed';
    }
    if(errorMessage != ''){
      this.dialogService.openMessageDialog('Error', errorMessage);
      return;
    }

    this.dataService.updateProgressBarSubject(true);
    this.dataService.put(
        '/tasks/'+this.taskId+'/save', 
        { 
          refNum: this.refNum, 
          instructions: this.instructions,
          procedureDetailsList: Array.from(this.summary.entries()).map(([key, value]) => ( {procedureType: key, teethList: value} ))
        }
      ).subscribe({
      next: (response) => {
        window.location.href = '#/task-list/in-progress'
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to Save, Please try again.');
      }
    });
  }

  deleteTask(){
    this.dataService.updateProgressBarSubject(true);
    this.dataService.delete('/tasks/'+this.taskId).subscribe({
      next: (response) => {
        this.dataService.updateProgressBarSubject(false);
        this.location.back();
      },
      error: (err) => {
        this.dataService.updateProgressBarSubject(false);
        this.location.back();
      }
    });
  }

  openFilesModal() {
    this.dialog.open(FilesComponent, { data: { taskId: this.taskId, refNum: this.refNum }, disableClose: true }).afterClosed().subscribe(result => this.scanFilesCount = result.scanFilesCount);
  }


}
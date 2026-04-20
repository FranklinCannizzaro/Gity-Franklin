import { Component } from '@angular/core';
import { DataService } from '../../Services/data.service';
import { DialogService } from '../../Services/dialog.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BarChartComponent } from '../bar-chart/bar-chart.component';

@Component({
  selector: 'app-dash-board',
  standalone: true,
  imports: [CommonModule, BarChartComponent],
  templateUrl: './dash-board.component.html',
  styleUrl: './dash-board.component.css'
})
export class DashBoardComponent {

  dashBoardDataComplete: any;
  dashBoardDataInComplete: any;
  dashBoardDataDelivered: any;
  role:any;

  constructor(private dataService: DataService, private dialogService: DialogService, private router: Router) { }

  ngOnInit() {
   
    this.role = this.dataService.role;
    this.dataService.updateTitle("Dashboard");
   
    this.getInProgressTasks();
    this.getCompletedTasks();
    if (this.role === 'doctor') {
      this.getDelivered();
    }
  }

  getDelivered() {
    this.dataService.getDataAsList('/tasks/delivered').subscribe({
      next: (response) => {
        this.dashBoardDataDelivered = response.length;
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get In Progress Tasks, Please try again.');
      }
    });
  }




  getInProgressTasks() {
    this.dataService.getDataAsList('/tasks/in-progress').subscribe({
      next: (response) => {       
        this.dashBoardDataInComplete = response.length;
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get In Progress Tasks, Please try again.');
      }
    });
  }
  getCompletedTasks() {
    this.dataService.getDataAsList('/tasks/complete').subscribe({
      next: (response) => {     
        this.dashBoardDataComplete = response.length;
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get In Progress Tasks, Please try again.');
      }
    });
  }


}
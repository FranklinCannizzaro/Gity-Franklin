import { Component } from '@angular/core';
import { DataService } from '../../Services/data.service';
import { DialogService } from '../../Services/dialog.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BarChartComponent } from '../bar-chart/bar-chart.component';

@Component({
  selector: 'app-dash-board',
  standalone: true,
  imports: [CommonModule, BarChartComponent, RouterModule],
  templateUrl: './dash-board.component.html',
  styleUrl: './dash-board.component.css'
})
export class DashBoardComponent {

  dashBoardDataComplete: number = 0;
  dashBoardDataInComplete: number = 0;
  dashBoardDataDelivered: number = 0;
  role: any;
  userName: string = '';

  // Bar values for welcome card decoration
  barVals: number[] = [38, 52, 44, 68, 58, 80, 72, 90, 65, 85, 74, 100];

  constructor(
    private dataService: DataService,
    private dialogService: DialogService,
    private router: Router
  ) { }

  ngOnInit() {
    this.role = this.dataService.role;
    this.userName = (this.dataService.firstName || '') + ' ' + (this.dataService.lastName || '');
    this.dataService.updateTitle('Dashboard');
    this.getInProgressTasks();
    this.getCompletedTasks();
    if (this.role === 'doctor') {
      this.getDelivered();
    }
  }

  // Calculate percentage for status bars
  getPercent(value: number): number {
    const total = (this.dashBoardDataComplete || 0)
      + (this.dashBoardDataInComplete || 0)
      + (this.dashBoardDataDelivered || 0);
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  getDelivered() {
    this.dataService.getDataAsList('/tasks/delivered').subscribe({
      next: (response) => {
        this.dashBoardDataDelivered = response.length;
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get delivered tasks.');
      }
    });
  }

  getInProgressTasks() {
    this.dataService.getDataAsList('/tasks/in-progress').subscribe({
      next: (response) => {
        this.dashBoardDataInComplete = response.length;
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get in-progress tasks.');
      }
    });
  }

  getCompletedTasks() {
    this.dataService.getDataAsList('/tasks/complete').subscribe({
      next: (response) => {
        this.dashBoardDataComplete = response.length;
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get completed tasks.');
      }
    });
  }
}

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
  barVals: number[] = [35, 50, 42, 65, 55, 78, 68, 88, 62, 82, 71, 100];

  constructor(
    private dataService: DataService,
    private dialogService: DialogService,
    private router: Router
  ) {}

  ngOnInit() {
    this.role = this.dataService.role;
    this.userName = ((this.dataService.firstName || '') + ' ' + (this.dataService.lastName || '')).trim();
    this.dataService.updateTitle('Dashboard');
    this.getInProgressTasks();
    this.getCompletedTasks();
    if (this.role === 'doctor') {
      this.getDelivered();
    }
  }

  getPercent(value: number): number {
    const total = (this.dashBoardDataComplete || 0)
      + (this.dashBoardDataInComplete || 0)
      + (this.dashBoardDataDelivered || 0);
    if (!total) return 0;
    return Math.round((value / total) * 100);
  }

  getDelivered() {
    this.dataService.getDataAsList('/tasks/delivered').subscribe({
      next: (r) => { this.dashBoardDataDelivered = r.length; },
      error: (e) => { this.dialogService.handleError(e, 'Fehler beim Laden der gelieferten Aufträge.'); }
    });
  }

  getInProgressTasks() {
    this.dataService.getDataAsList('/tasks/in-progress').subscribe({
      next: (r) => { this.dashBoardDataInComplete = r.length; },
      error: (e) => { this.dialogService.handleError(e, 'Fehler beim Laden der laufenden Aufträge.'); }
    });
  }

  getCompletedTasks() {
    this.dataService.getDataAsList('/tasks/complete').subscribe({
      next: (r) => { this.dashBoardDataComplete = r.length; },
      error: (e) => { this.dialogService.handleError(e, 'Fehler beim Laden der abgeschlossenen Aufträge.'); }
    });
  }
}

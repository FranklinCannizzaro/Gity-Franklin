import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../Services/data.service';
import { BarChartComponent } from '../bar-chart/bar-chart.component';

@Component({
  selector: 'app-dash-board',
  standalone: true,
  imports: [CommonModule, BarChartComponent],
  templateUrl: './dash-board.component.html',
  styleUrl: './dash-board.component.css'
})
export class DashBoardComponent implements OnInit {

  dashBoardDataComplete: any;
  dashBoardDataInComplete: any;
  dashBoardDataDelivered: any;
  role: any;
  firstName: any;

  constructor(
    public dataService: DataService,
    public router: Router
  ) {}

  ngOnInit() {
    this.role = this.dataService.role;
    this.firstName = this.dataService.firstName;
    this.dataService.updateTitle('Dashboard');
    this.getInProgressTasks();
    this.getCompletedTasks();
    if (this.role === 'doctor') {
      this.getDelivered();
    }
  }

  getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Guten Morgen';
    if (h < 18) return 'Guten Tag';
    return 'Guten Abend';
  }

  getDelivered() {
    this.dataService.getDataAsList('/tasks/delivered').subscribe({
      next: (response) => { this.dashBoardDataDelivered = response.length; },
      error: () => {}
    });
  }

  getInProgressTasks() {
    this.dataService.getDataAsList('/tasks/in-progress').subscribe({
      next: (response) => { this.dashBoardDataInComplete = response.length; },
      error: () => {}
    });
  }

  getCompletedTasks() {
    this.dataService.getDataAsList('/tasks/completed').subscribe({
      next: (response) => { this.dashBoardDataComplete = response.length; },
      error: () => {}
    });
  }
}

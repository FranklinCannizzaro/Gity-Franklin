import { Component, Input, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../Services/data.service';
import { DialogService } from '../../Services/dialog.service';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, ChartType, ChartData, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

Chart.register(...registerables);

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.css'
})
export class BarChartComponent {
  @Input() boardDataFromParent: any;
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  barChartType: ChartType = 'bar';
  role: any;

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: false,
        ticks: { color: '#205567' },
        grid: { color: 'transparent' }
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#205567' },
        grid: { color: 'transparent' }
      }
    }
  };

  barChartData: ChartData<'bar'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: []
  };

  constructor(
    private dataService: DataService,
    private dialogService: DialogService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dataService.updateProgressBarSubject(true);

    if (!this.dataService.role) {
      setTimeout(() => this.ngOnInit(), 100);
      return;
    }

    this.role = this.dataService.role;

    this.initializeDatasets();
    this.fetchChartData('/tasks/complete', 0, 'Completed Tasks');
    this.fetchChartData('/tasks/in-progress', 1, 'In-Progress Tasks');

    if (this.role === 'doctor') {
      this.fetchChartData('/tasks/delivered', 2, 'Delivered Tasks');
    }

    this.dataService.updateProgressBarSubject(false);
  }

  private initializeDatasets(): void {
    this.barChartData.datasets = [
      {
        label: 'Job Completed',
        data: new Array(12).fill(0),
        backgroundColor: '#63d3b6',
        borderColor: '#008A70',
        borderWidth: 1
      },
      {
        label: 'Job In-Process',
        data: new Array(12).fill(0),
        backgroundColor: '#898989',
        borderColor: '#205567',
        borderWidth: 1
      }
    ];

    if (this.role === 'doctor') {
      this.barChartData.datasets.push({
        label: 'Job Delivered',
        data: new Array(12).fill(0),
        backgroundColor: '#ffa726',
        borderColor: '#ef6c00',
        borderWidth: 1
      });
    }
  }

  private fetchChartData(endpoint: string, datasetIndex: number, label: string): void {
    this.dataService.getDataAsList(endpoint).subscribe({
      next: (response) => {
        const monthlyCounts = this.getMonthlyTaskCounts(response);
        this.barChartData.datasets[datasetIndex].data = monthlyCounts;
        this.chart?.update();
      },
      error: (err) => {
        this.dialogService.handleError(err, `Failed to get ${label}, Please try again.`);
      }
    });
  }

  private getMonthlyTaskCounts(tasks: any[]): number[] {
    const monthlyCounts = new Array(12).fill(0);
    tasks.forEach((job) => {
      try {
        const date = new Date(job.createTime);
        const monthIndex = date.getMonth();
        if (!isNaN(monthIndex)) {
          monthlyCounts[monthIndex]++;
        }
      } catch (e) {
        console.error('Error parsing date:', job.createTime);
      }
    });
    return monthlyCounts;
  }
}

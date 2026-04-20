import { Component } from '@angular/core';
import { DataService } from '../../Services/data.service';
import { DialogService } from '../../Services/dialog.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { MatMenuModule } from '@angular/material/menu';

import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';


export interface Notification {
  notificationId: number;
  taskId: number;
  type: string;
  commentId: number;
  fileId: number;
  active: boolean;
  comments: string;
  refNum: string;
  crtBy: string;
  crtTm: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatFormFieldModule, MatInputModule, DatePipe, MatCheckboxModule, MatIconModule, MatButtonModule, MatBadgeModule, MatMenuModule, MatTooltipModule, MatDialogModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent {

 
 
  notificationData: Notification[] = [];
 

  constructor(public dataService: DataService, private dialogService: DialogService, private route: ActivatedRoute, private dialog: MatDialog, private location: Location, private router: Router) { }

  ngOnInit() {
    this.dataService.updateTitle("Notifications");
    this.getNotifications();
  }

 

  getNotifications() {
    this.dataService.updateProgressBarSubject(true);
    this.dataService.getDataAsList('/common/notifications').subscribe({
      next: (response) => {
        this.notificationData = response;
        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get Notifications, Please try again.');
      }
    });
  }


  navigateToOrderDetails(taskId: number, type: string) {
    this.router.navigate(['/task-details'], { queryParams: { taskId: taskId, notificationType: type } });
  }
 

}
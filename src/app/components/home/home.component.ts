import { MediaMatcher } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DataService } from '../../Services/data.service';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog } from '@angular/material/dialog';
import { CreateUserComponent } from '../create-user/create-user.component';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HttpParams } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatSlideToggleModule, NgbPopoverModule, NgbDropdownModule, MatProgressSpinnerModule,
    MatButtonModule, RouterLink, RouterOutlet, MatSidenavModule, MatToolbarModule,
    MatIconModule, CommonModule, MatMenuModule, MatBadgeModule,
     MatSnackBarModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  updateTask(taskId: any, action: any) {
    this.dataService.post(`/tasks/update-task-assignments?taskId=${taskId}&action=${action}`, {}).subscribe({
      next: () => this.fetchNotifications(),
      error: (err) => {
        console.error('Error updating task status:', err);
        this.dataService.openMessageDialog('Error', 'Failed to update task status.');
      }
    });
  }

  version = environment.version;

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  public notifications: Array<any> = [
    
  ];

  unreadCount = 0;
  private lastSeenId: number | null = null;
  private pollSub?: Subscription;

  isAvailable: boolean = false;
  isTogglingAvailability: boolean = false;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public dataService: DataService,
    private router: Router,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 1200px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit(): void {
    if (this.dataService.role == 'doctor') {
      this.dataService.updateCartCount();
      this.getDrNotifications();
      this.updateDrNotificationStatus([101, 102, 103]);
    }

    if(this.dataService.role != 'doctor') {
      this.fetchNotifications();
      this.pollSub = timer(60000, 60000).subscribe(() => this.fetchNotifications());
    } 
    
    

  
    this.isAvailable = this.dataService.isAvailable;
  }

  private updateDrNotificationStatus(taskId: number | number[]): void {

    
    const ids = Array.isArray(taskId) ? taskId : [taskId];
  
    this.dataService.post('/tasks/update/dr-notification', ids).subscribe({
      next: () => this.getDrNotifications(),
      error: (err) => {
        console.error('Error updating doctor notification status:', err);
        this.dataService.openMessageDialog('Error', 'Failed to update notification status.');
      }
    });
  }
  


  private getDrNotifications(): void {
    this.dataService.get('/tasks/dr-notification', {}).subscribe({
      next: (res) => {  
        console.log('Fetched doctor notifications:', res);
      },
      error: (err) => {
        console.error('Error fetching doctor notifications:', err);
      }
    });
  }
  



  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
    this.pollSub?.unsubscribe();
  }

 
  


  private fetchNotifications(): void {
    this.dataService.get('/common/notifications-user', {}).subscribe({
      next: (res) => {
        const list: any[] = Array.isArray(res) ? res : [];
       console.log('Fetched notifications:', list);
        const sorted = [...list].sort((a, b) => (b.id ?? b.taskId ?? 0) - (a.id ?? a.taskId ?? 0));

        let newItems = 0;
        if (this.lastSeenId != null) {
          newItems = sorted.filter(n => (n.id ?? n.taskId ?? 0) > this.lastSeenId!).length;
        }

        this.notifications = sorted;
        this.unreadCount += newItems;


        const topId = (sorted[0]?.id ?? sorted[0]?.taskId ?? null);
        if (topId != null) this.lastSeenId = topId;


        if (newItems > 0) {
          const ref = this.snack.open(
            `${newItems} new notification${newItems > 1 ? 's' : ''}`,
            'View',
            { duration: 6000, horizontalPosition: 'center', verticalPosition: 'bottom' }
          );
          ref.onAction().subscribe(() => this.openNotificationsMenu());
          
        }
      },
      error: (err) => console.error('Error fetching notifications:', err)
    });
  }

 
  markAllRead(): void {
    this.unreadCount = 0;
 
  }

 
  openNotificationsMenu(): void {
    
  }

  onToggleAvailability(event: MatSlideToggleChange): void {
    const checked = event.checked;
    this.isAvailable = checked;
    const userId = this.dataService.userId;
    this.isTogglingAvailability = true;
    const params = `?userId=${encodeURIComponent(userId)}&available=${checked}`;
    this.dataService.post(`/user/set-availability${params}`, {}).subscribe({
      next: () => {
        this.dataService.isAvailable = checked;
        sessionStorage.setItem('isAvailable', checked.toString());
        this.isTogglingAvailability = false;
      },
      error: () => {
        this.isAvailable = !checked; 
        this.dataService.openMessageDialog('Error', 'Failed to update availability.');
        this.isTogglingAvailability = false;
      }
    });
  }

  navigateToOrderDetails(taskId: number) {
    this.router.navigate(['/task-details'], { queryParams: { taskId: taskId } });
  }

  onCartClick(_: Event): void {
    if (this.dataService.cartCount > 0) {
      this.router.navigate(['/task-list/pending-payment']);
    } else {
      this.dataService.openMessageDialog('Info', 'Cart is Empty, please add a new Task to place an Order.');
    }
  }

  logout() {
    this.dataService.clearUserDetails();
    this.router.navigate(['/login']);
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  openChangePasswordModal() {
    this.dialog.open(ChangePasswordComponent , { disableClose: true, autoFocus: false });
  }
}

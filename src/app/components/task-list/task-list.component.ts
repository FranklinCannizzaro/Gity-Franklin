import { Component, TemplateRef, ViewChild } from '@angular/core';
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
import { CommentsComponent } from '../comments/comments.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FilesComponent } from '../files/files.component';
import { MatMenuModule } from '@angular/material/menu';
import { OptionsDialogComponent } from '../dialogs/options-dialog/options-dialog.component';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { FeedbackDialogComponent } from './feedback-dialog/feedback-dialog.component';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';

export interface Task {
  taskId: number;
  instructions: string;
  createBy: string;
  createTime: string;
  assignTo: string;
  assignTime: string;
  completeBy: string;
  completeTime: string;
  refNum: string;
  status: string;
  feedbackId: number;
  totalHoldTime: number;
  amount: number;
  tier: string;
  deliveryTime: number;
  units: number;
  designerFirstName: string;
  designerLastName: string;
  doctorFirstName: string;
  doctorLastName: string;
  timeLeft: { hours: number; minutes: number }; // keep existing
  timeLeftStr?: string; 
}



@Component({
  selector: 'app-in-progress',
  standalone: true,
  imports: [MatPaginatorModule,CommonModule,MatSelectModule,MatCardModule,FormsModule, MatFormFieldModule, MatInputModule, DatePipe, MatCheckboxModule, MatIconModule, MatButtonModule, MatBadgeModule, MatMenuModule, MatTooltipModule, MatDialogModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent {



// utils/time-left.ts
 


downloadandSearch: boolean= true;


downloadScanFiles() {
throw new Error('Method not implemented.');
}
selectedDesigner: any;
selectedDoctor: any;

onMultiSelectChange($event: Event) {
throw new Error('Method not implemented.');
}

  title: any = { 'dashboard': 'Dashboard', 'all-tasks': 'In Progress Tasks', 'my': 'My Tasks', 'complete': 'Completed Tasks', 'pending-payment': 'Pending Payment', 'delivered': 'Delivered' };

  inProgressCount: any

  statusMap = new Map<string, string>([
    ['SU', 'Created'],
    ['IP', 'In Progress'],
    ['OH', 'On Hold'],
    ['PF', 'Pending Feedback'],
    ['IC', 'In Correction'],
    ['CO', 'Complete'],
    ['PP', 'Pending Payment'],
    ['NW', 'New Order']
  ]);

  feedbackMap = new Map<number, string>([
    [4, 'Approved'],
    [3, 'Optimized'],
    [2, 'Approved with Corrections'],
    [1, 'Rejected']
  ]);

  feedbackColorMap = new Map<number, string>([
    [1, 'lightgreen'],
    [2, 'lightblue'],
    [3, 'lightsalmon'],
    [4, 'orangered']
  ]);

  timeLeft: any;
  status: string = '';
  taskData: Task[] = [];
  filteredTaskData: Task[] = [];
  selectedTaskIds: number[] = [];
  procSummaryByTask: Map<number, string> = new Map();
  doctorList: any[] = [];
  designerList: any[] = [];

  fileCountsNew: any = {}
  fileCountsDesign: any = {}
  fileCountsScan: any = {}
  fileCountsTotal: any = {}

  commentCountsNew: any = {}
  commentCountsTotal: any = {}
  showMultiFiler: boolean = true;

  constructor(public dataService: DataService, private dialogService: DialogService, private route: ActivatedRoute, private dialog: MatDialog, private location: Location, private router: Router) { }
  downloadOrder(taskId: any) {
   this.dataService.updateProgressBarSubjectForSlider(true);
   this.dataService.get('/tasks/'+taskId+'/pdf/', { responseType: 'blob' }).subscribe({
     next: (response) => {
       const blob = new Blob([response], { type: 'application/octet-stream' });
       
       const url = window.URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = taskId + 'order_form.pdf';
       document.body.appendChild(a);
       a.click();
       a.remove();
       window.URL.revokeObjectURL(url);
       this.dataService.updateProgressBarSubjectForSlider(false);
     },
     error: (err) => {
       this.dialogService.handleError(err, 'Failed to download the file, Please try again.');
     }
   }); 
    
    }
    
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.status = params['status'];
      this.dataService.updateTitle(this.title[this.status]);
      this.initData();
      // this.updatePagination();
      this.selectedPerson = null;
      this.clearAllStatuses();
    });
  }
 
  initData() {
    // this.getProcedureDetails();
    this.getFileCountsFromBackend();
    // this.getCommentsCountsFromBackend();
    this.getTasks();
    
  }

  generateRandomId() {
    return Math.floor(Math.random() * 1000000000);
  }

  applyFilter(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.filteredTaskData = this.taskData.filter(item => {
      var stringToSearch = JSON.stringify(item) + JSON.stringify(this.procSummaryByTask.get(item.taskId));
      return stringToSearch.toLowerCase().includes(searchTerm.toLowerCase());
    });
  
    this.currentPage = 0; // reset to first page
    this.updatePagination(); // ← IMPORTANT
  }
  filterDesigner($event: MatSelectChange): void {
    this.selectedDesigner = $event.value;
  
    if (this.selectedDesigner) {
      this.filteredTaskData = this.taskData.filter(task => task.assignTo === this.selectedDesigner);
    } else {
      this.filteredTaskData = this.taskData;
    }
  }

  filterDoctor($event: MatSelectChange): void {
    this.selectedDoctor = $event.value;
  
    if (this.selectedDoctor) {
      this.filteredTaskData = this.taskData.filter(task => task.createBy === this.selectedDoctor);
    } else {
      this.filteredTaskData = this.taskData;
    }
  }
  
  getFilteredTask(selectedStatus: string[]) {
    this.dataService.updateProgressBarSubject(true);
  
    this.dataService.getDataAsList('/tasks/'+this.status).subscribe({
      next: (response) => {
        this.taskData = response;

        if(this.taskData.length == 0) {
          this.dataService.updateProgressBarSubject(false);
          this.router.navigate(['/dashboard']);
          return;
        }

        this.inProgressCount = this.taskData.length;
        
        this.filteredTaskData = this.taskData;
        this.filteredTaskData = this.filteredTaskData.filter(task => selectedStatus.includes(task.status));
        this.updatePagination();
       
        if (this.status != 'pending-payment') {
          this.dataService.updateProgressBarSubject(false);
        }else{
          this.createPaypalOrder();
          this.loadPayPalScript();
          const orderTotal = this.taskData.map(td => td.amount).reduce((a, b) => a + b, 0);
          this.paypalOrder = { id: this.generateRandomId(), purchase_units: [{amount: {value: orderTotal.toFixed(2), currency_code: 'EUR'}}] };
        }

      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get In Progress Tasks, Please try again.');
      }
    });
  }
 


  

  onStatusFilterChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selected: string[] = [];
  
    Array.from(selectElement.selectedOptions).forEach(option => {
      selected.push(option.value);
    });
  
    this.selectedStatuses = selected;
  
    if (this.selectedStatuses.length === 0) {
      this.filteredTaskData = [...this.taskData]; // show all
    } else {
      this.filteredTaskData = this.taskData.filter(task =>
        this.selectedStatuses.includes(task.status)
      );
    }
  
    this.currentPage = 0;
    this.updatePagination();
  }


  statusOptions = [
    { value: 'NW', label: 'New' },
    { value: 'IP', label: 'In Progress' },
    { value: 'PF', label: 'Delivered' },
    { value: 'CO', label: 'Complete' }
  ];
  
  getStatusBadgeStyle(status: string): { [key: string]: string } {
    switch (status) {
      case 'NW':
        return { backgroundColor: '#EDEDED', color: '#5C5C5C' }; // New
      case 'IP':
        return { backgroundColor: '#FFF8E0', color: '#B19700' }; // In Progress
      case 'AR':
        return { backgroundColor: '#E5ECF6', color: '#0057B8' }; // Awaiting Review
      case 'RV':
        return { backgroundColor: '#F2F2F2', color: '#5C5C5C' }; // In Revision
      case 'CO':
        return { backgroundColor: '#DFF5E5', color: '#1E824C' }; // Completed
      case 'DL':
        return { backgroundColor: '#FFF3E0', color: '#F57C00' }; // Delayed
      case 'CA':
        return { backgroundColor: '#FDECEA', color: '#D32F2F' }; // Cancelled
      default:
        return { backgroundColor: '#E0E0E0', color: '#333' };
    }
  }

  
  openFeedbackModal(taskId: number, refNum: string) {
    this.dialog.open(FeedbackDialogComponent, { width: '60%', height: '80%', data: { taskId: taskId, refNum: refNum, feedbackMap: this.feedbackMap } }).afterClosed().subscribe(result => {
      if (result) {
        this.getTasks();
      }
    });
  }

  openCommentModal(taskId1: number, refNum1: string) {
    this.dialog.open(CommentsComponent, { maxWidth: '70vw', height: 'auto', data: { taskId: taskId1, refNum: refNum1 } }).afterClosed().subscribe(result => this.getCommentsCountsFromBackend());
  }

  completeTask(taskId: number, refNum: string) {
    this.dialog.open(ConfirmDialogComponent, { width: '25%', data: { title: 'Confirm Task Completion?', lines: ['Case / Patient: ' + refNum, 'Task Id: ' + taskId] } }).afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.dataService.updateProgressBarSubject(true);
      this.dataService.put('/tasks/' + taskId + '/complete', {}).subscribe({
        next: (response) => {
          this.getTasks();
          this.dataService.updateProgressBarSubject(false);
        },
        error: (err) => {
          this.dialogService.handleError(err, 'Failed to Complete task, Please try again.');
        }
      });
    });
  }

  claimTask(taskId: number, refNum: string) {
    this.dialog.open(ConfirmDialogComponent, { width: '25%', data: { title: 'Confirm Task Acceptance?', lines: ['Case / Patient: ' + refNum, 'Task Id: ' + taskId] } }).afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.dataService.updateProgressBarSubject(true);
      this.dataService.put('/tasks/' + taskId + '/claim', {}).subscribe({
        next: (response) => {
          this.taskData = this.taskData.filter(task => task.taskId !== taskId);
          this.filteredTaskData = this.taskData;
          this.dataService.updateProgressBarSubject(false);
        },
        error: (err) => {
          this.dialogService.handleError(err, 'Failed to Accept task, Please try again.');
        }
      });
    });
  }

  holdTask(taskId: number) {
    this.dataService.updateProgressBarSubject(true);
    this.dataService.put('/tasks/' + taskId + '/hold', {}).subscribe({
      next: (response) => {
        this.getTasks()
        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to put Task on Hold, Please try again.');
      }
    });
  }

  deleteTask(taskId: number) {
    this.dialog.open(ConfirmDialogComponent, { width: '25%', data: { title: 'Confirm Task Deletion?', lines: ['Task Id: ' + taskId] } }).afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.dataService.updateProgressBarSubject(true);
      this.dataService.delete('/tasks/' + taskId).subscribe({
        next: (response) => {
          this.dataService.updateProgressBarSubject(false);
          this.dataService.updateCartCount();
          this.initData();
        },
        error: (err) => {
          this.dataService.updateProgressBarSubject(false);
          this.dialogService.handleError(err, 'Failed to remove item from cart, Please try again.');
        }
      });
    });
  }

  resumeTask(taskId: number) {
    this.dataService.updateProgressBarSubject(true);
    this.dataService.put('/tasks/' + taskId + '/resume', {}).subscribe({
      next: (response) => {
        this.getTasks()
        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to Resume the Task, Please try again.');
      }
    });
  }

  openFilesModal(taskId1: number, refNum1: string) {
    this.dialog.open(FilesComponent, { width: '60%', height: '80%', data: { taskId: taskId1, refNum: refNum1 } }).afterClosed().subscribe(result => this.getFileCountsFromBackend());
  }

  combineToothNumbers(input: string[]): string {
    return this.dataService.combineToothNumbers(input.map(Number));
  }

  getFileCountsFromBackend() {
    this.dataService.updateProgressBarSubject(true);
    if (this.status == 'all-tasks') {
     // this.getCommentsCountsFromBackend();
      return;
    }
    
    this.dataService.getDataAsList('/tasks/files/' + this.status).subscribe({
      next: (response) => {
        this.fileCountsDesign = {}; this.fileCountsScan = {}; this.fileCountsNew = {}; this.fileCountsTotal = {};
        response.forEach(task => {
          this.fileCountsDesign[task.taskId] = task.designCount;
          this.fileCountsScan[task.taskId] = task.scanCount;
          this.fileCountsNew[task.taskId] = task.newCount;
          this.fileCountsTotal[task.taskId] = task.designCount + task.scanCount;
        });
        // this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get File Counts, Please try again.');
      }
    });
  }

  getCommentsCountsFromBackend() {
    this.dataService.updateProgressBarSubject(true);
    this.dataService.getDataAsList('/tasks/comments/' + this.status).subscribe({
      next: (response) => {
        response.forEach(task => {
          this.commentCountsNew[task.taskId] = task.newCount;
          this.commentCountsTotal[task.taskId] = task.totalCount;
        });
        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get Comment Counts, Please try again.');
      }
    });
  }

  getProcedureDetails() {
    this.dataService.updateProgressBarSubject(true);
    this.dataService.getDataAsList('/tasks/procs/' + this.status).subscribe({
      next: (response) => {
        response.forEach(task => {
          var summaryStr: string = Array.from(task.procedureDetailsList).map((proc: any) =>
            `(${proc.teethList.length} Unit${proc.teethList.length > 1 ? 's' : ''}) ${proc.procedureDesc.replaceAll('<hr>', '')}`
          ).join('<br>');
          this.procSummaryByTask.set(task.taskId, summaryStr);
        });
        // this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get Task Rx Details, Please try again.');
      }
    });
  }
  // Whole hours left (0 if overdue)
getHoursLeft(createdAt: string | Date, durationHours: number): number {
  const deadline = new Date(createdAt).getTime() + Number(durationHours) * 3_600_000;
  const hours = (deadline - Date.now()) / 3_600_000;
  return Math.max(0, Math.floor(hours));
}

getHourAndTimeTimeLeft(createdAt: string | Date, durationHours: number): string {
  const deadline = new Date(createdAt).getTime() + Number(durationHours) * 3_600_000;
  const diffMs = deadline - Date.now();

  if (diffMs <= 0) {
    return "0h 0m";
  }

  const totalMinutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}



  getTasks(): void {
    this.dataService.updateProgressBarSubject(true);
  
    this.dataService.getDataAsList('/tasks/' + this.status).subscribe({
      next: (response) => {
        this.taskData = response;
  
        if (!this.taskData.length) {
          this.dataService.updateProgressBarSubject(false);
          this.router.navigate(['/dashboard']);
          return;
        }
  
        this.inProgressCount = this.taskData.length;
        this.taskData.forEach(task => {
          task.status = this.statusMap.get(task.status) || task.status;
          task.timeLeftStr= this.getHourAndTimeTimeLeft(task.createTime, task.deliveryTime)
      })
     
      console.log('Task Data with Time Left:', this.taskData);
           
        this.filteredTaskData = this.taskData;

        this.updatePagination(); 
      



        const doctorMap = new Map<string, { doctorFirstName: string, doctorLastName: string, count: number }>();
        this.taskData.forEach(task => {
          if (!doctorMap.has(task.createBy)) {
            doctorMap.set(task.createBy, {
              doctorFirstName: task.doctorFirstName,
              doctorLastName: task.doctorLastName,
              count: 1
            });
          } else {
            doctorMap.get(task.createBy)!.count += 1;
          }
        });

        this.doctorList = Array.from(doctorMap.entries()).map(([value, doc]) => ({
          id: value,
          firstName: doc.doctorFirstName,
          lastName: doc.doctorLastName,
          count: doc.count
        }));

        const designerMap = new Map<string, { designerFirstName: string, designerLastName: string, count: number }>();
        this.taskData.forEach(task => {
          if (!designerMap.has(task.assignTo)) {
            designerMap.set(task.assignTo, {
              designerFirstName: task.designerFirstName,
              designerLastName: task.designerLastName,
              count: 1
            });
          } else {
            designerMap.get(task.assignTo)!.count += 1;
          }
        });

        this.designerList = Array.from(designerMap.entries()).map(([value, designer]) => ({
          id: value,
          firstName: designer.designerFirstName,
          lastName: designer.designerLastName,
          count: designer.count
        }));



        
  
        // this.designerList = [...new Set(this.taskData.map(task => task.assignTo))]
        //   .map(designer => ({ name: designer, value: designer }));
  
        if (this.status === 'pending-payment') {
          this.showMultiFiler = false;
           this.createPaypalOrder();
           this.loadPayPalScript();
  
         
          const orderTotal = this.taskData.reduce((sum, td) => sum + (td.amount || 0), 0);
          this.paypalOrder = {
            id: this.generateRandomId(),
            purchase_units: [{
              amount: { value: orderTotal.toFixed(2), currency_code: 'EUR' }
            }]
          };
        }
  
        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get In Progress Tasks, Please try again.');
      }
    });
  }
  
  selectTask(taskId: number,  isChecked: boolean) {
    const index = this.selectedTaskIds.indexOf(taskId);
    if (index === -1) {
      this.selectedTaskIds.push(taskId);
    } else {
      this.selectedTaskIds.splice(index, 1);
    }
  }



  toggleAllSelections(isChecked: boolean): void {
    if (isChecked) {
      this.filteredTaskData.forEach(task => {
        if (this.fileCountsTotal[task.taskId] && this.fileCountsTotal[task.taskId] !== 0) {
          this.selectedTaskIds.push(task.taskId);
        }
      });
    } else {
      this.selectedTaskIds.splice(0, this.selectedTaskIds.length);
    }
  }
  
  
  areAllSelected(): boolean {
    return this.filteredTaskData.every(task =>
      this.fileCountsTotal[task.taskId] &&
      this.selectedTaskIds.includes(task.taskId)
    );
  }
  
  someSelected(): boolean {
    return this.filteredTaskData.some(task =>
      this.fileCountsTotal[task.taskId] &&
      this.selectedTaskIds.includes(task.taskId)
    );
  }

  downloadSelectedTaskFiles() {
    if (this.selectedTaskIds.length == 0) {
      this.dialogService.openMessageDialog('Error', 'Select a Task to download files.');
    } else {
      const dialogData = {
        title: 'Select File Type',
        options: new Map<string, string>([['scan', 'Scan Files'], ['design', 'Design Files']])
      }

      this.dialog.open(OptionsDialogComponent, { data: dialogData, }).afterClosed()
        .subscribe(selectedOption => {
          if (selectedOption) {
            Array.from(this.selectedTaskIds).forEach(taskId => this.downloadAllFiles(taskId, selectedOption));
          } else {
            return;
          }
        });
    }
  }


  downloadAllFiles(taskId: number, selectedOption: string) {
    this.dataService.updateProgressBarSubject(true);
    this.dataService.get('/tasks/' + taskId + '/files/all?fileType=' + selectedOption, { responseType: 'blob' }).subscribe({
      next: (response) => {
        if (response.size == 0) {
          this.dialogService.openMessageDialog('Info', 'No ' + selectedOption + ' files to download for Task Id: ' + taskId);
        } else {
          const blob = new Blob([response], { type: 'application/octet-stream' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = taskId + '.zip';
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        }
        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to download all files, Please try again.');
      }
    });
  }

  loadPayPalScript() {
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=AbBeaL5iOV9LSkn_LmH1az1AfZXoNEAUgAHxNTomYnOP16AG_fy0GwnkDJvvvrrNBqohzCzHzD7nxKWg&components=buttons&currency=EUR';
    script.onload = () => {
      this.renderPayPalButton();
    };
    document.body.appendChild(script);
  }

  paypalOrder: any = {};

  createPaypalOrder() {
    this.clearAllStatuses();
    this.downloadandSearch = false;
    this.dataService.updateProgressBarSubject(true);
    this.dataService.post('/payments/paypal/orders', {}).subscribe({
      next: (response) => {
        this.paypalOrder = response;
        this.dataService.updateProgressBarSubject(false);
      },
      // error: (err) => {
      //   // this.dialogService.handleError(err, 'Failed to create order, Please try again.').subscribe(result => this.location.back());
      // }
    });
  }

  edit(taskId: number) {
    this.router.navigate(['/create-task-demo'], { queryParams: { taskId: taskId } });
  }

  navigateToOrderDetails(taskId: number) {
    this.router.navigate(['/task-details'], { queryParams: { taskId: taskId } });
  }

  completePayment() {
    this.dataService.updateProgressBarSubject(true);
    this.dataService.post('/payments/paypal/orders/' + this.paypalOrder.id + '/capture?amount='+this.paypalOrder.purchase_units[0].amount.value, this.taskData.map(td => td.taskId)).subscribe({
      next: (response) => {
        this.dataService.updateProgressBarSubject(false);
        this.router.navigate(['/payment-success'], { queryParams: { id: response.id } });
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to complete order, Please try again.').subscribe(result => window.location.href = '#/task-list/pending-payment');
      }
    });
  }

  bypassPayment() {
    this.dataService.updateProgressBarSubject(true);
    this.dataService.post('/payments/paypal/orders/' + this.paypalOrder.id + '/bypass-payment?amount='+this.paypalOrder.purchase_units[0].amount.value, this.taskData.map(td => td.taskId)).subscribe({
      next: (response) => {
        this.dataService.updateProgressBarSubject(false);
        this.dataService.updateCartCount();
        this.router.navigate(['/payment-success'], { queryParams: { id: this.paypalOrder.id } });
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to complete order, Please try again.').subscribe(result => window.location.href = '#/task-list/pending-payment');
      }
    });
  }

  renderPayPalButton() {
    window.paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return this.paypalOrder.id; // the order is created on page load.
      },
      onApprove: (data: any, actions: any) => {
        // this.dataService.updateProgressBarSubject(true);
        return this.dataService.post('/payments/paypal/orders/' + this.paypalOrder.id + '/capture', this.taskData.map(td => td.taskId)).subscribe({
          next: (response) => {
            // console.log('Payment Details:', response);
            // this.dataService.updateProgressBarSubject(false);
            this.dataService.updateCartCount();
            this.router.navigate(['/payment-success'], { queryParams: { id: response.id } });
            // this.dialogService.openMessageDialog('Success', 'Payment Successful, Order Reference Number: ' + response.id).subscribe(result => {
            //   this.dataService.updateCartCount();
            //   window.location.href = '#/dashboard';
            // });
          },
          error: (err) => {
            this.dialogService.handleError(err, 'Failed to complete order, Please try again.').subscribe(result => window.location.href = '#/task-list/pending-payment');
          }
        });

      },
      onError: (err: any) => {
        console.error('PayPal Error:', err);
      },
      style: {
        layout: 'horizontal',
        color: 'gold',
        shape: 'rect',
        label: 'pay',
        tagline: false,
        height: 38
      }
    }).render('#paypal-button-container');
  }


  selectedStatuses: string[] = [];

  pageSize = 10;
  currentPage = 0;
  paginatedData: any[] = [];
  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePagination();
  }
  
  updatePagination() {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.filteredTaskData.slice(start, end);
  }

  onPersonFilterChange(selectedValue: string | null): void {
    this.selectedPerson = selectedValue;
  
    if (!this.selectedPerson) {
      this.filteredTaskData = [...this.taskData];
    } else {
      this.filteredTaskData = this.dataService.role === 'doctor'
        ? this.taskData.filter(task => task.assignTo === this.selectedPerson)
        : this.taskData.filter(task => task.createBy === this.selectedPerson);
    }
  
    this.currentPage = 0;
    this.updatePagination();
  }
  

selectedPerson: string | null = null;

compareNull = (a: any, b: any): boolean => a === b;


onPersonBootstrapFilterChange(event: Event): void {
  const selectedValue = (event.target as HTMLSelectElement).value;
  this.selectedPerson = selectedValue || null;

  if (!this.selectedPerson) {
    this.filteredTaskData = [...this.taskData];
  } else {
    this.filteredTaskData = this.dataService.role === 'doctor'
      ? this.taskData.filter(task => task.assignTo === this.selectedPerson)
      : this.taskData.filter(task => task.createBy === this.selectedPerson);
  }

  this.currentPage = 0;
  this.updatePagination();
}


toggleStatus(statusValue: string): void {
  const index = this.selectedStatuses.indexOf(statusValue);
  if (index >= 0) {
    this.selectedStatuses.splice(index, 1);
  } else {
    this.selectedStatuses.push(statusValue);
  }

  this.filteredTaskData = this.selectedStatuses.length === 0
    ? [...this.taskData]
    : this.taskData.filter(task => this.selectedStatuses.includes(task.status));

  this.currentPage = 0;
  this.updatePagination();
}
get selectedStatusLabel(): string {
  if (!this.selectedStatuses.length) return 'Select Status';
  return this.selectedStatuses.map(s => this.statusMap.get(s) || s).join(', ');
}


clearAllStatuses(): void {
  this.selectedStatuses = [];
  this.filteredTaskData = [...this.taskData];
  this.currentPage = 0;
  this.updatePagination();
}






  selectedOptions: string[] = [];

  toggleOption(option: string) {
    const idx = this.selectedOptions.indexOf(option);
    if (idx > -1) {
      this.selectedOptions.splice(idx, 1);
    } else {
      this.selectedOptions.push(option);
    }
  }

  clearAll() {
    this.selectedOptions = [];
  }

  applyFilters() {
  
    if (this.selectedOptions.length === 0) {
      this.filteredTaskData = [...this.taskData];
    } else {
      this.filteredTaskData = this.dataService.role === 'doctor'
        ? this.taskData.filter(task => this.selectedOptions.includes(task.assignTo))
        : this.taskData.filter(task => this.selectedOptions.includes(task.createBy));
    }
  
    this.currentPage = 0;
    this.updatePagination();



  }




}

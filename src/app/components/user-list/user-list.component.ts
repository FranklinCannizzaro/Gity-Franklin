import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DataService } from '../../Services/data.service';
import { Router } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CreateUserComponent } from '../create-user/create-user.component';
import { DialogService } from '../../Services/dialog.service';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface UserList {
  userID: string;
  emailID: string;
  firstname: string;
  lastName: string;
  role: string;
  primarySkill: string;
  lastlogin: string;

}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule,MatCheckboxModule,MatIcon, MatButtonModule, MatTooltipModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'], // Fixed typo
})
export class UserListComponent implements AfterViewInit {
  
  displayedColumns: string[] = ['select','userID', 'emailID', 'firstname', 'lastName', 'role', 'primarySkill', 'lastlogin',  'delete'];
   

  dataSource = new MatTableDataSource<UserList>();
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<any>;

  constructor(public dataService: DataService,private router: Router, private dialog: MatDialog, private dialogService :DialogService) {}


  ngOnInit() {
    this.dataService.updateTitle("User List");
  }


  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    this.fetchUserList();
    
  }

  fetchUserList(){
    const url = this.dataService.role === 'tl' ? '/user/userlist/tl' : '/user/userlist/admin';

    this.dataService.get(url).subscribe({
      next: (data: UserList[]) => { 
        this.dataSource.data = data;
      },
      error: (err) => {
        console.error('Error fetching user list', err);
      },
    });
  }

  // onRowClick(userId: string): void {
  //   this.router.navigate(['/edit-user', userId]);
    
  // }

  selection = new SelectionModel<any>(true, []);

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  isAnySelected(): boolean {
    return this.selection.selected.length > 0;
  }

  toggleSelectAll(event: any): void {
    if (event.checked) {
      this.selection.select(...this.dataSource.data);
    } else {
      this.selection.clear();
    }
  }

  onCheckboxChange(row: any): void {
    this.selection.toggle(row);
  }


  onBulkDelete(): void {
    const selectedUserIds = this.getSelectedUserIds();

    if (selectedUserIds.length > 0) {
      console.log('Selected User IDs:', selectedUserIds);
      
    this.deleteApi(selectedUserIds);
      this.selection.clear(); // Clear selection after deletion
      console.log(`Deleted users:`, selectedUserIds);
    }
  }
  getSelectedUserIds(): string[] {
    return this.selection.selected.map((row) => row.userId);
  }

  onDelete(element: any): void {
    const index = this.dataSource.data.findIndex((item) => item === element);
    const selectedUserIds = this.getSelectedUserIds();
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '500px', data: {title: 'Confirm User Deletion?', lines: [`Are you sure you want to delete user with ID: ${element.userId}?`]}});

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (index !== -1) {
          this.dataSource.data.splice(index, 1); 
          this.dataSource._updateChangeSubscription(); 
          this.deleteApi([element.userId]);
        }
      }
    });
  }
  
  deleteApi(userList : any){
    this.dataService.post(`/user/deleteUser`,userList).subscribe({
      next: ()=> { 
       this.fetchUserList();
     },
     error: (err) => {
       console.error('Error deleting user list', err);
     },
   });
  }


  addUser(){
    const dialogRef = this.dialog.open(CreateUserComponent, { width: '500px' });
    dialogRef.afterClosed().subscribe((result) => {
      this.fetchUserList()
    });
  }

}

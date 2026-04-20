import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../Services/data.service';
import JSZip from 'jszip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommentDialogComponent } from '../dialogs/comment-dialog/comment-dialog.component';

interface TaskList {
  userId: string;
  assementId: number;
  file: string;
  fileContent?: string;
  reviewComment: string;
  designComment: string | null;
  fileName: string;
  badgeClass?: string;
}

interface GroupedTasks {
  [userId: string]: TaskList[];
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  taskList: TaskList[] = [];
  groupedTasks: GroupedTasks = {};
  response: any;
  description: string = '';

  public readonly TIER_MAP: { [key: number]: { tier: string } } = {
    1: { tier: "GOLD" },
    2: { tier: "SILVER" },
    3: { tier: "PLATINUM" }
  };

  constructor(private dataService: DataService, private dialog: MatDialog) {}

  ngOnInit() {
   this.getPendinList();
   this.dataService.updateTitle("Admin");
  }

    getPendinList(){
      this.dataService.get('/assessment/userAssessmentDetails/Y').subscribe({
        next: (response: TaskList[]) => {
          this.taskList = response;
          
          // Group tasks by userId
          this.groupedTasks = this.taskList.reduce((groups: GroupedTasks, task) => {
            if (!groups[task.userId]) {
              groups[task.userId] = [];
            }
            const tier = this.TIER_MAP[Number(task.assementId)];
            task.badgeClass = tier ? this.getTestTypeBadgeClass(tier.tier) : 'bg-primary text-white';
            groups[task.userId].push(task);
            return groups;
          }, {});
        }
      });
    }

  getTestTypeBadgeClass(type: string): string {
    switch(type) {
      case 'GOLD': return 'bg-warning text-dark';
      case 'SILVER': return 'bg-secondary text-white';
      case 'PLATINUM': return 'bg-info text-white';
      default: return 'bg-primary text-white';
    }
  }

  downloadAllFiles(tasks: TaskList[]) {
    const zip = new JSZip();

    tasks.forEach((task, index) => {
      try {
        // Get file content from the correct property
        const content = task.file; // Use task.file directly since it contains the file content
        if (!content) {
          console.error(`No file content for ${task.fileName} at index ${index}`);
          return;
        }

        // Convert base64 to binary
        try {
          const binaryString = atob(content);
          const byteArray = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            byteArray[i] = binaryString.charCodeAt(i);
          }
          
          zip.file(task.fileName, byteArray, { binary: true }); // Add file to zip and log success
          
        } catch (decodeError) {
          console.error(`Error decoding file ${task.fileName}:`, decodeError);
        }
        
      } catch (error) {
        console.error(`Error processing file ${task.fileName}:`, error);
      }
    });

    // Generate and download zip
    zip.generateAsync({ type: 'blob' })
      .then(content => {
        const url = window.URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `files_${tasks[0].userId}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(error => {
        console.error('Error generating zip:', error);
      });
  }

  private isBase64(str: string): boolean {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  }

  approve(taskId: string) {
    this.openCommentDialog('Approve Task').subscribe(comment => {
      if (comment) {
        const formData = new FormData();
        const commentBlob = new Blob([comment], { type: 'text/plain' });
        const emailId = new Blob([this.dataService.emailId], { type: 'text/plain' }); 
        const commentFile = new File([commentBlob], 'comment.txt', { type: 'text/plain' });
        formData.append('comment', commentFile);
        formData.append('emailId', emailId);
            console.log('taskId', this.dataService.emailId);
        this.dataService.post('/assessment/adminApproval/'+taskId+'/CO', formData).subscribe({
          next: (response: any) => {
            this.getPendinList();
          }
        });
      }
    });
  }

  Reject(taskId: string) {
    this.openCommentDialog('Reject Task').subscribe(comment => {
      if (comment) {
        const formData = new FormData();
        const commentBlob = new Blob([comment], { type: 'text/plain' });
        const emailId = new Blob([this.dataService.emailId], { type: 'text/plain' }); 
        const commentFile = new File([commentBlob], 'comment.txt', { type: 'text/plain' });
        formData.append('comment', commentFile);
        formData.append('emailId', emailId);
        
        this.dataService.post('/assessment/adminApproval/'+taskId+'/RJ', formData).subscribe({
          next: (response: any) => {
            this.getPendinList();
          }
        });
      }
    });
  }

  private openCommentDialog(title: string) {
    const dialogRef = this.dialog.open(CommentDialogComponent, {
      width: '500px',
      data: { title }
    });

    return dialogRef.afterClosed();
  }

  getTierName(assementId: number): string {
    if (assementId === undefined || assementId === null) {
      return 'N/A';
    }
    const tier = this.TIER_MAP[assementId];
    return tier ? tier.tier : 'Unknown';
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  downloadFile(fileContent: string, fileName: string) {
    try {
      const blob = new Blob([fileContent], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }
}

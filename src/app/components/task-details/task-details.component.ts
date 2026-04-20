import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { CommonModule, Location, NgOptimizedImage } from '@angular/common';

import {MatListModule} from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { DataService } from '../../Services/data.service';
import { DialogService } from '../../Services/dialog.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommentsComponent } from '../comments/comments.component';
import { MyBoolean, OrderDetailsNew, ToothDataNew } from '../create-task-demo/create-task-demo.component';
import { PropAComponent } from '../create-task-demo/prop-a/prop-a.component';
import { PropHComponent } from '../create-task-demo/prop-h/prop-h.component';
import { PropPComponent } from '../create-task-demo/prop-p/prop-p.component';
import { PropCollarsComponent } from '../create-task-demo/prop-collars/prop-collars.component';
import { PropCutbackComponent } from '../create-task-demo/prop-cutback/prop-cutback.component';
import { PropPonticComponent } from '../create-task-demo/prop-pontic/prop-pontic.component';
import { PropVComponent } from '../create-task-demo/prop-v/prop-v.component';
import { MatRadioModule } from '@angular/material/radio';
import { firstValueFrom } from 'rxjs';
import { MatBadgeModule } from '@angular/material/badge';
import { FilesComponent } from '../files/files.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FeedbackDialogComponent } from '../task-list/feedback-dialog/feedback-dialog.component';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';  
import { FilesDialogComponent } from '../files-dialog/files-dialog.component';
import { DoctorReviewDialogComponent } from '../doctor-review-dialog/doctor-review-dialog.component';
import { MagnifierComponent } from '../magnifier/magnifier.component';
import { PdfExportService } from '../../Services/pdf-export.service';
import { HomeComponent } from '../home/home.component';

export interface RxDetails {
  procedureId: number;
  procedureType: string;
    teethList: string[];
  }

export interface FileDetails {
  fileId: number;
  fileType: string;
  fileName: string;
}

export interface Comments {
  userId: string;
  comment: string;
  createTime: string;
}

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [ RouterLink,HomeComponent,FormsModule, CommentsComponent, FilesComponent, MatTooltipModule, MatBadgeModule, MatRadioModule, PropAComponent, PropPComponent, PropHComponent, PropPonticComponent, PropVComponent, MatCardModule, CommonModule, MatListModule, MatIconModule, MatButtonModule, MatDialogModule, NgOptimizedImage, MagnifierComponent, PropCollarsComponent, PropCutbackComponent],
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.css', '../../../style-custom.css'],
})
export class TaskDetailsComponent {

  @ViewChild('sectionToPdf', { static: false }) pdfContainer?: ElementRef;
  @ViewChild('sectionToPdf') sectionToPdf!: ElementRef<HTMLElement>;
  @Input() orderDetailsNew!: OrderDetailsNew;
  @Input() fileDetailsImagesContent!: string[]
  @Input() fromSummary: boolean = false;
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

  // get getBridgedToothData(){
  //   return this.orderDetailsNew.toothData.filter(data => data.type == 'Bridge');
  // }
  


   getToothColorForVisual(tooth: string): string {
    var color = "#ffffff";
    if(this.orderDetailsNew.toothData.some(data => data.teeth == Number(tooth) && data.subType == 'Crown')){
      color = '#397EAC';
    }else if(this.orderDetailsNew.toothData.some(data => data.teeth == Number(tooth) && data.subType == 'Pontic')){
      color = '#3939AC';
    }else if(this.orderDetailsNew.toothData.some(data => data.teeth == Number(tooth) && data.subType == 'Inlay/Onlay')){
      color = '#7E39AC';
    }else if(this.orderDetailsNew.toothData.some(data => data.teeth == Number(tooth) && data.subType == 'Veneer')){
      color = '#AC3995';
    }
    return color;
  }


  getTextColorForVisual(tooth: string): string {
    return this.orderDetailsNew.toothData.some(data => data.teeth == Number(tooth)) ? '#000000' : '#979797';
  }

  showVisualRectBridge(toothIdA: number, toothIdB: number): boolean{
    let isBridge = false;
    this.orderDetailsNew.toothData.forEach(data => {
      if(data.teeth == toothIdA && data.teeth == toothIdB){
        isBridge = true;
      }
    });
    return this.showVisualRect(toothIdA) && this.showVisualRect(toothIdB) && isBridge;
  }

  showVisualRect(toothId: number): boolean{
    let returnValue = false;
    this.orderDetailsNew.toothData.forEach(data => {
      if(data.teeth == toothId){
        returnValue = true;
      }
    });
    return returnValue;
  }
  async saveSection(fileName: string) {
    this.dataService.updateProgressBarSubjectForSlider(true);
    try {
      
      await (document as any).fonts?.ready?.catch(() => {});
      await new Promise(r => setTimeout(r, 0)); 
  
      await this.pdf.exportElement(this.sectionToPdf.nativeElement, {
        fileName: 'order_' +fileName || 'section.pdf',
        format: 'a4',
        marginMm: 8,
        scale: 2
      });
    } catch (err) {
      this.dialogService.handleError(err, 'Failed to generate PDF. Please try again.');
    } finally {
      this.dataService.updateProgressBarSubjectForSlider(false);
    }
  }
  
  get getPonticToothData(): ToothDataNew[]{
    return this.orderDetailsNew.toothData.filter(data => data.subType.includes('Pontic'));
  }

  get anteriorTeeth(): number[]{
    return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.toothData.map(data => data.teeth)).anterior;
  }

  get posteriorTeeth(): number[]{
    return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.toothData.map(data => data.teeth)).posterior;
  }

  get anteriorTeethForCrownOrPontic(): number[]{
    return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.toothData.filter(data => data.subType == 'Crown' || data.subType == 'Pontic').map(data => data.teeth)).anterior;
  }

  get posteriorTeethForCrownOrPontic(): number[]{
    return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.toothData.filter(data => data.subType == 'Crown' || data.subType == 'Pontic').map(data => data.teeth)).posterior;
  }

  get getAllToothCountFromOrderDetails(): number {
    return this.orderDetailsNew.toothData.reduce((acc, data) => acc + 1, 0);
  }
  get getPlanSubTitleFromTier(): string {
    let subTitle = ''
    switch (this.orderDetailsNew.tier){
      case 'silver':
        subTitle = 'Essential Design'
        break;
      case 'gold':
        subTitle = 'Advanced Quality'
        break;
      case 'platium':
        subTitle = 'Design Elite'
        break;  
        default :
        subTitle = ''
    }
    return subTitle;
  }

  getTeethByComma(teeth: number[]): string {
    return teeth.sort((a, b) => a - b).join(', ');
  }

  taskId: number = 0;
  taskDetails: any;
  status: string = '';
  showSliderFile: MyBoolean = { value: false };
  showSliderComments: MyBoolean = { value: false };

  constructor(private router: Router, private home:HomeComponent, private pdf: PdfExportService,public dataService: DataService, private dialogService: DialogService, private route: ActivatedRoute, private location: Location, private dialog: MatDialog){
  }


    get getBridgeToothData(): any[] {
      var bridgeMaterialData: any[] = []

      this.orderDetailsNew.bridges.forEach(bridge => {
        this.orderDetailsNew.toothData.filter(data => data.teeth == bridge.bridgedTeeth[0]).forEach(data => {
          bridgeMaterialData.push({
            'teeth': bridge.bridgedTeeth.join(', '),
            'material': data.props['Material'],
            'minimalThickness': data.minimalThickness,
            'cementGap': data.cementGap,
            'marginGap': data.marginGap,
            'horizontalBorder': data.horizontalBorder,
            'radiusCompensation': data.radiusCompensation
          });
        });
      });

      return bridgeMaterialData;;
    }

    get getNonBridgeToothData(): ToothDataNew[] {
      return this.orderDetailsNew.toothData.filter(data => !data.bridgeConnectionType);
    }

    get getToothDataForVisualisation(): ToothDataNew[] {
      var toothDataToReturn: ToothDataNew[] = [];
      // toothDataToReturn.push(...this.getBridgeToothData);
      // toothDataToReturn.push(...this.orderDetailsNew.toothData.filter(data => !data.bridgeConnectionType && !this.getBridgeToothData.some(bts => this.dataService.checkTwoSetIntersect(data.teeth, bts.teeth))));
      return toothDataToReturn;
    }

  updateFileCounts(filesData: any){
    this.fileDetailsScan = filesData.fileDetailsScan;
    this.fileDetailsImages = filesData.fileDetailsImages;
    this.fileDetailsImagesContent = filesData.fileDetailsImagesContent;
  }

  notificationType: string = '';

  ngOnInit(){
    // this.dataService.updateTitle("Task Details");

    this.route.queryParamMap.subscribe(params => {
      this.taskId = Number(params.get('taskId'));

      //if(params.get('comingFrom') == 'notifications'){
        this.notificationType = params.get('notificationType') || '';
      //}

    });

    if(this.taskId > 0){
      this.dataService.updateProgressBarSubject(true);
      this.dataService.get('/tasks/'+this.taskId).subscribe({
        next: (response) => {
          this.taskDetails = response;
          this.orderDetailsNew = JSON.parse(response.jsonData);
          this.updateNotifications();
          this.getFileDetails();
          this.getComments();
          // this.getFileCountsFromBackend();
          // this.getCommentsCountsFromBackend();
        },
        error: (err) => {
          this.dialogService.handleError(err, 'Failed to get Task Details, Please try again.');
        }
      });
    }
  }



  updateNotifications(){
    if(this.notificationType != 'comment' && this.notificationType != 'task delivered'){
      return;
    }

    this.dataService.updateProgressBarSubject(true);
      this.dataService.post('/common/notifications/'+this.taskId+'/inactive?type='+this.notificationType, {}).subscribe({
        next: (response) => {
          // this.showSliderComments.value = true;
          if(this.notificationType == 'comment'){
            this.openCommentModal();
          }
        },
        error: (err) => {
          // this.dialogService.handleError(err, 'Failed to Complete task, Please try again.');
        }
      });
  }



  async populateImagesContent(fileId: number) {
    try {
      const response = await firstValueFrom(this.dataService.get('/tasks/' + this.taskId + '/files/' + fileId, { responseType: 'blob' }));
      this.fileDetailsImagesContent.push(URL.createObjectURL(new Blob([response], { type: 'application/octet-stream' })));
    } catch (err) {
      this.dialogService.handleError(err, 'Failed to get File Contents, Please try again.');
    }
  }

    fileDetailsScan: FileDetails[] = [];
    fileDetailsImages: FileDetails[] = [];
    // fileDetailsImagesContent: string[] = [];
    fileDetailsOrderForm: FileDetails[] = [];
    fileDetailsDesign: FileDetails[] = [];
    fileDetailsVisual: FileDetails[] = [];
    fileDetailsCorrectedDesign: FileDetails[] = [];
    fileDetailsCorrected3dVisualisation: FileDetails[] = [];

  getFileDetails(){
    this.dataService.updateProgressBarSubject(true);
    this.dataService.getDataAsList('/tasks/'+this.taskId+'/files').subscribe({
      next: (response: FileDetails[]) => {
        this.fileDetails = response;

        this.fileDetailsScan = [];
        this.fileDetailsDesign = [];
        this.fileDetailsVisual = [];
        this.fileDetailsImages = [];
        this.fileDetailsImagesContent = [];
        this.fileDetailsCorrectedDesign = [];
        this.fileDetailsCorrected3dVisualisation = [];

        response.forEach(file => {
          if(file.fileType == 'scan'){
            this.fileDetailsScan.push(file);
          }else if(file.fileType == 'design'){
            this.fileDetailsDesign.push(file);
          }else if(file.fileType == 'visual'){
            this.fileDetailsVisual.push(file);
          }else if(file.fileType == 'images'){
            this.fileDetailsImages.push(file);
            this.populateImagesContent(file.fileId);
          }else if(file.fileType == 'correcteddesign'){
            this.fileDetailsCorrectedDesign.push(file);
          }else if(file.fileType == 'correctedvisual'){
            this.fileDetailsCorrected3dVisualisation.push(file);
          }else{
            this.fileDetailsDesign.push(file);
          }
        });

        if(this.taskDetails.status == 'PF' && this.dataService.role == 'doctor' && this.notificationType != 'comment'){
          this.openFeedbackDialog();
        }

        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get Files for this Task, Please try again.');
      }
    });
  }


  openFeedbackDialog(){
    this.dialog.open(DoctorReviewDialogComponent, { 
      width: '60%', 
      height: '80%', 
      data: { 
        taskId: this.orderDetailsNew.taskId, 
        refNum: this.orderDetailsNew.refNum, 
        fileDetailsDesign: this.fileDetailsDesign, 
        fileDetailsVisual: this.fileDetailsVisual,
        fileDetailsCorrectedDesign: this.fileDetailsCorrectedDesign, 
        fileDetailsCorrectedVisual: this.fileDetailsCorrected3dVisualisation,
        taskStatus: this.taskDetails.status,
        feedbackId: this.taskDetails.feedbackId,
        cancelReason: this.taskDetails.cancelReason,
        remainingCorrections: this.taskDetails.remainingCorrections,
        tier: this.taskDetails.tier
      }  
    });
  }

  commentCountsNew: any = {}
  commentCountsTotal: any = {}

  getCommentsCountsFromBackend() {
    this.dataService.updateProgressBarSubject(true);
    this.dataService.getDataAsList('/tasks/comments/' + this.statusMapForBackendCall.get(this.taskDetails.status)).subscribe({
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

  openCommentModal() {
    this.dialog.open(CommentsComponent, { maxWidth: '70vw', height: '80vh', data: { taskId: this.orderDetailsNew.taskId, refNum: this.orderDetailsNew.refNum } }).afterClosed()
        .subscribe();
  }


  statusMap = new Map<string, string>([
    ['SU', 'Created'],
    ['IP', 'In Progress'],
    ['OH', 'On Hold'],
    ['PF', 'Pending Feedback'],
    ['IC', 'In Correction'],
    ['CO', 'Complete'],
    ['PP', 'Pending Payment']
  ]);

  fileCountsNew: any = {}
  fileCountsDesign: any = {}
  fileCountsScan: any = {}
  fileCountsVisual: any = {}
  fileCountsDesignImages: any = {}
  fileCountsOrderForm: any = {}
  fileCountsTotal: any = {}

  openFilesModal() {
    this.dialog.open(FilesDialogComponent, { width: '60%', height: '80%', data: { taskId: this.orderDetailsNew.taskId, refNum: this.orderDetailsNew.refNum, taskStatus: this.taskDetails.status } }).afterClosed()
            .subscribe(result => {
              this.fileDetailsScan = result.fileDetailsScan;
              this.fileDetailsImages = result.fileDetailsImages;
              this.fileDetailsImagesContent = result.fileDetailsImagesContent;
            });
  }


  openFilesModalForDownload(fileName : any) {
  
    const dialogRef = this.dialog.open(FilesComponent, {
      width: '60%',
      height: '80%',
      data: {
        taskId: this.orderDetailsNew.taskId,
        refNum: this.orderDetailsNew.refNum,
        onDownload: () => this.saveSection(fileName)     
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.fileDetailsScan = result.fileDetailsScan;
      this.fileDetailsImages = result.fileDetailsImages;
      this.fileDetailsImagesContent = result.fileDetailsImagesContent;
    });
  }
  

  getFileCountsFromBackend() {
    this.dataService.updateProgressBarSubject(true);
    this.dataService.getDataAsList('/tasks/files/' + this.statusMapForBackendCall.get(this.taskDetails.status)).subscribe({
      next: (response) => {
        this.fileCountsDesign = {}; this.fileCountsScan = {}; this.fileCountsNew = {}; this.fileCountsTotal = {};
        response.forEach(task => {
          this.fileCountsDesign[task.taskId] = task.designCount;
          this.fileCountsScan[task.taskId] = task.scanCount;
          this.fileCountsVisual[task.taskId] = task.visualCount;
          this.fileCountsDesignImages[task.taskId] = task.designImagesCount;
          this.fileCountsOrderForm[task.taskId] = task.orderformCount;
          this.fileCountsNew[task.taskId] = task.newCount;
          this.fileCountsTotal[task.taskId] = task.designCount + task.scanCount + task.visualCount + task.designImagesCount + task.orderformCount;
        });
        // this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get File Counts, Please try again.');
      }
    });
  }

  // title: any = { "dashboard": "Dashboard", 'in-progress': 'In Progress Tasks', my: 'My Tasks', complete: 'Completed Tasks', 'pending-payment': 'Pending Payment' };
  // statusMap = new Map<string, string>([
  //   ['SU', 'Created'],
  //   ['IP', 'In Progress'],
  //   ['OH', 'On Hold'],
  //   ['PF', 'Pending Feedback'],
  //   ['CO', 'Complete'],
  //   ['PP', 'Pending Payment']
  // ]);

  statusMapForBackendCall = new Map<string, string>([
    ['SU', 'Created'],
    ['IP', 'in-progress'],
    ['OH', 'in-progress'],
    ['PF', 'in-progress'],
    ['CO', 'complete'],
    ['PP', 'pending-payment']
  ]);

  feedbackMap = new Map<number, string>([
    [4, 'Approved'],
    [3, 'Optimized'],
    [2, 'Approved with Corrections'],
    [1, 'Rejected']
  ]);

  openFeedbackModal(taskId: number, refNum: string) {
    this.dialog.open(FeedbackDialogComponent, { width: '60%', height: '80%', data: { taskId: taskId, refNum: refNum, feedbackMap: this.feedbackMap } }).afterClosed().subscribe(result => {
      if (result) {
        this.ngOnInit();
        this.dialogService.openMessageDialog('Feedback Complete', 'Feedback captured completely.');
      }
    });
  }

  updateTask(taskId: any,action: string) {
      this.home.updateTask(taskId,action);
      this.router.navigate(['task-list/all-tasks']);

   
    }

  // completeTask(taskId: number, refNum: string) {
  //   this.dialog.open(ConfirmDialogComponent, { width: '25%', data: { title: 'Confirm Task Completion?', lines: ['Case / Patient: ' + refNum, 'Task Id: ' + taskId] } }).afterClosed().subscribe(result => {
  //     if (!result) {
  //       return;
  //     }

  //     this.dataService.updateProgressBarSubject(true);
  //     this.dataService.put('/tasks/' + taskId + '/complete', {}).subscribe({
  //       next: (response) => {
  //         this.ngOnInit();
  //         this.dataService.updateProgressBarSubject(false);
  //         this.dialogService.openMessageDialog('Task Complete', 'Task compelted successfully.');
  //       },
  //       error: (err) => {
  //         this.dialogService.handleError(err, 'Failed to Complete task, Please try again.');
  //       }
  //     });
  //   });
  // }


















  selectedTeeth: string[] = [];
  rxDetails: RxDetails[] = [];
  fileDetails: FileDetails[] = [];
  comments: Comments[] = [];


  selectedItem: string = '';


  // constructor(private dataService: DataService, private dialogService: DialogService, private route: ActivatedRoute, private location: Location, private dialog: MatDialog){}

  // isDoctor(){
  //   return this.dataService.getRole() == 'ROLE_doctor';
  // }

  // ngOnInit(){
  //   // this.isDoctor = this.dataService.getRole() == 'ROLE_doctor';

  //   this.route.queryParamMap.subscribe(params => {
  //     this.taskId = Number(params.get('taskId'));
  //   });

  //   this.dataService.updateProgressBarSubject(true);
  //   this.dataService.get('/tasks/'+this.taskId).subscribe({
  //     next: (response) => {
  //       this.taskDetails = response;
  //       this.getRxDetails();
  //       this.getFileDetails();
  //       this.getComments();
  //     },
  //     error: (err) => {
  //       this.dialogService.handleError(err, 'Failed to get Task Details, Please try again.');
  //     }
  //   });
  // }



  postComment(comment: string){
    if(comment == undefined || comment == ''){
      return;
    }
    this.dataService.updateProgressBarSubject(true);
    this.dataService.post('/tasks/'+this.taskId+'/comments', comment).subscribe({
      next: (response) => {
        this.getComments();
        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to post comment, Please try again.');
      }
    });
  }

  getComments(){
    this.dataService.updateProgressBarSubject(true);
    this.dataService.getDataAsList('/tasks/'+this.taskId+'/comments').subscribe({
      next: (response) => {
        this.comments = response;
        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get Comments for this Task, Please try again.');
      }
    });
  }

  downloadFile(fileId: number, fileName: string){
    this.dataService.updateProgressBarSubject(true);
    this.dataService.get('/tasks/'+this.taskId+'/files/'+fileId, { responseType: 'blob' }).subscribe({
      next: (response) => {
        console.log(response.headers);
        const blob = new Blob([response], { type: 'application/octet-stream' });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to download the file, Please try again.');
      }
    });
  }


  downloadAllFiles(){
    this.dataService.updateProgressBarSubject(true);
    this.dataService.get('/tasks/'+this.taskId+'/files/all', { responseType: 'blob' }).subscribe({
      next: (response) => {
        console.log(response.headers);
        const blob = new Blob([response], { type: 'application/octet-stream' });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.taskId+'.zip';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to download all files, Please try again.');
      }
    });
  }



  getRxDetails(){
    this.dataService.updateProgressBarSubject(true);
    this.dataService.getDataAsList('/tasks/'+this.taskId+'/procs').subscribe({
      next: (response) => {
        this.rxDetails = response;
        this.dataService.updateProgressBarSubject(false);
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to get Rx Details for this Task, Please try again.');
      }
    });
  }




  // getFileDetails(){
  //   this.dataService.updateProgressBarSubject(true);
  //   this.dataService.getDataAsList('/tasks/'+this.taskId+'/files').subscribe({
  //     next: (response) => {
  //       this.fileDetails = response;
  //       this.dataService.updateProgressBarSubject(false);
  //     },
  //     error: (err) => {
  //       this.dialogService.handleError(err, 'Failed to get Files for this Task, Please try again.');
  //     }
  //   });
  // }

  addFileDetails(event: any){
    var fileList: FileList = event.target.files;
    if (fileList.length == 0) {
      this.dialogService.openMessageDialog('Error', 'Select a file to Upload.');
    }else{
      Array.from(fileList).forEach(file => this.uploadSingleFile(file));
    }
  }

  uploadSingleFile(file: File){
    this.dataService.updateProgressBarSubject(true);
    this.dataService.postFile('/tasks/'+this.taskId+'/files', file).subscribe({
      next: (response) => {
        this.getFileDetails();
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to Upload File, Please try again.');
      }
    });
  }

  removeFileDetails(fileId: number){
    this.dataService.updateProgressBarSubject(true);
    this.dataService.delete('/tasks/'+this.taskId+'/files/'+fileId).subscribe({
      next: (response) => {
        this.getFileDetails();
      },
      error: (err) => {
        this.dialogService.handleError(err, 'Failed to Remove File, Please try again.');
      }
    });
  }
  public waitUntilPdfReady(): Promise<void> {
    return new Promise(resolve => {
      const check = () => {
        if (this.pdfContainer?.nativeElement) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  }


  generatePDF(id: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const content = this.pdfContent.nativeElement;

      html2canvas(content).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 190;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 10;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        const pdfBlob = pdf.output('blob');
        resolve(pdfBlob);
      }).catch((error) => reject(error));
    });
  }

  reject(error: any): void {
    console.error('Error generating PDF:', error);
  }


  teethList = [
    18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
    48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
  ];

  showBridge(toothIdA: number, toothIdB: number): boolean{

    var returnVal = false;

    this.orderDetailsNew.bridges.forEach(bridge => {


      var bridgeStarted = false;
      var bridgeEnded = false;
      this.teethList.forEach(teeth => {

        if(teeth == bridge.start){
          bridgeStarted = true;
        }

        if(teeth == bridge.end){
          bridgeEnded = true;
        }

        if(bridgeStarted && !bridgeEnded){
          if(teeth == toothIdA){
            returnVal = true;
          }
        }


      });

    });


    return returnVal;


  }

  showBridgeDot(toothId: number): boolean{
    return this.orderDetailsNew.toothData.some(data => data.teeth == toothId && data.bridgeConnectionType != '');
  }

  get anteriorPonticTeeth(): number[]{
    return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.toothData.filter(data => data.subType == 'Pontic').map(data => data.teeth)).anterior;
  }

  get posteriorPonticTeeth(): number[]{
    return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.toothData.filter(data => data.subType == 'Pontic').map(data => data.teeth)).posterior;
  }

  get anteriorBridgedTeeth(): number[]{
    return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()).anterior;
  }

  get posteriorBridgedTeeth(): number[]{
    return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()).posterior;
  }

  get anteriorTeethForFrame_1(): number[]{
    return this.dataService.groupByAnteriorAndPosterior_1(this.orderDetailsNew.toothData.filter(data => data.type == 'Frame').map(data => data.teeth)).anterior;
  }

  get posteriorTeethForFrame_1(): number[]{
    return this.dataService.groupByAnteriorAndPosterior_1(this.orderDetailsNew.toothData.filter(data => data.type == 'Frame').map(data => data.teeth)).posterior;
  }

  get anteriorBridgedTeethFrame_1(): number[]{
    var bridgedTeeth = this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()
    if(bridgedTeeth.some(teeth => this.orderDetailsNew.toothData.some(data => data.teeth == teeth && data.type == 'Frame'))){
      return this.dataService.groupByAnteriorAndPosterior_1(bridgedTeeth).anterior;
    }else {
      return [];
    }

    // return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()).anterior;
  }

  get posteriorBridgedTeethFrame_1(): number[]{
    var bridgedTeeth = this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()
    if(bridgedTeeth.some(teeth => this.orderDetailsNew.toothData.some(data => data.teeth == teeth && data.type == 'Frame'))){
      return this.dataService.groupByAnteriorAndPosterior_1(bridgedTeeth).posterior;
    }else {
      return [];
    }

    // return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()).posterior;
  }


  get anteriorBridgedTeethFrame(): number[]{
    var bridgedTeeth = this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()
    if(bridgedTeeth.some(teeth => this.orderDetailsNew.toothData.some(data => data.teeth == teeth && data.type == 'Frame'))){
      return this.dataService.groupByAnteriorAndPosterior(bridgedTeeth).anterior;
    }else {
      return [];
    }

    // return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()).anterior;
  }

  get posteriorBridgedTeethFrame(): number[]{
    var bridgedTeeth = this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()
    if(bridgedTeeth.some(teeth => this.orderDetailsNew.toothData.some(data => data.teeth == teeth && data.type == 'Frame'))){
      return this.dataService.groupByAnteriorAndPosterior(bridgedTeeth).posterior;
    }else {
      return [];
    }

    // return this.dataService.groupByAnteriorAndPosterior(this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()).posterior;
  }

  get bridgedTeethFrame(): number[]{
    var bridgedTeeth = this.orderDetailsNew.bridges.map(b => b.bridgedTeeth).flat()
    if(bridgedTeeth.some(teeth => this.orderDetailsNew.toothData.some(data => data.teeth == teeth && data.type == 'Frame'))){
      return bridgedTeeth;
    }else {
      return [];
    }
  }


  get isFrameCrownSelected(): boolean {
    return this.orderDetailsNew.toothData.some(data => data.subType == 'Crown' && data.type == 'Frame');
  }
  get isFramePonticSelected(): boolean {
    return this.orderDetailsNew.toothData.some(data => data.subType == 'Pontic' && data.type == 'Frame');
  }
  get isFrameInlayOnlaySelected(): boolean {
    return this.orderDetailsNew.toothData.some(data => data.subType == 'Inlay/Onlay' && data.type == 'Frame');
  }
  get isFrameVeneerSelected(): boolean {
    return this.orderDetailsNew.toothData.some(data => data.subType == 'Veneer' && data.type == 'Frame');
  }

  
  get isAnatomyCrownSelected(): boolean {
    return this.orderDetailsNew.toothData.some(data => data.subType == 'Crown' && data.type == 'Anatomy');
  }
  get isAnatomyPonticSelected(): boolean {
    return this.orderDetailsNew.toothData.some(data => data.subType == 'Pontic' && data.type == 'Anatomy');
  }
  get isAnatomyInlayOnlaySelected(): boolean {
    return this.orderDetailsNew.toothData.some(data => data.subType == 'Inlay/Onlay' && data.type == 'Anatomy');
  }
  get isAnatomyVeneerSelected(): boolean {
    return this.orderDetailsNew.toothData.some(data => data.subType == 'Veneer' && data.type == 'Anatomy');
  }


  get isBridgeSelected(): boolean {
    return this.orderDetailsNew.bridges.length > 0;
  }


  articulationDetailsPropsDefaultValues: any = {
    'Protrusion Angle': '30',
    'Bennett Angle': '15',
    'Immediate Side Shift (ISS)': '0.5',
    'Incisal Guidance': '10',
    'Raising or lowering the articulator': '-0.2'
  }

  get articulationDetailsWithNonDefaultValues(): any[]{
    var articulationDetailsWithNonDefaultValues: any[] = [];

    Object.keys(this.orderDetailsNew.articulationDetails.props).forEach(key => {
      if(this.orderDetailsNew.articulationDetails.props[key] != this.articulationDetailsPropsDefaultValues[key]){
        articulationDetailsWithNonDefaultValues.push({key: key, value: this.orderDetailsNew.articulationDetails.props[key]});
      }
    });

    return articulationDetailsWithNonDefaultValues;
  }

  get articulationDetailsWithDefaultValues(): any[]{
    var articulationDetailsWithDefaultValues: any[] = [];

    Object.keys(this.orderDetailsNew.articulationDetails.props).forEach(key => {
      if(this.orderDetailsNew.articulationDetails.props[key] == this.articulationDetailsPropsDefaultValues[key]){
        articulationDetailsWithDefaultValues.push({key: key, value: this.orderDetailsNew.articulationDetails.props[key]});
      }
    });

    return articulationDetailsWithDefaultValues;
  }



  updateTaskacceptance(data: string) {
    
    this.dataService.updateProgressBarSubject(true);
    this.dataService.post('/tasks/'+this.taskId+'/'+data, {}).subscribe({
     // console.log('Task acceptance updated:', data);
    //   next: (response) => {
    //     // this.showSliderComments.value = true;
    //     if(this.notificationType == 'comment'){
    //       this.openCommentModal();
    //     }
    //   },
    //   error: (err) => {
    //     // this.dialogService.handleError(err, 'Failed to Complete task, Please try again.');
    //   }
    // 
  });
  
}

get calculateAmountOnTimeAndTier(): number {
    let amount = 0.0;

    if (this.orderDetailsNew.showAi) {
      if (this.orderDetailsNew.deliveryTime == "10") {
        amount = 3.87;
      }

      if (this.orderDetailsNew.deliveryTime == "4") {
        amount = 4.78;
      }
    }

    if (this.orderDetailsNew.tier == 'silver') {
      amount = 6.99;
    }

    if (this.orderDetailsNew.tier == 'gold') {
      amount = 12.99;
      if (this.orderDetailsNew.deliveryTime === "12") {
        amount += 2.99;
      }
    }

    if (this.orderDetailsNew.tier == 'platinum') {
      amount = 31.99;
      if (this.orderDetailsNew.deliveryTime === "12") {
        amount += 2.99;
      }
      if (this.orderDetailsNew.deliveryTime === "8") {
        amount += 4.99;
      }
    }

    return amount * this.orderDetailsNew.toothData.length; // Multiply by number of teeth selected
  }
  
get getOrderAmount(): number{

    if(this.orderDetailsNew && this.orderDetailsNew.amount){
        return this.orderDetailsNew.amount
    }else{
      return this.calculateAmountOnTimeAndTier
    }
   return 0; 
  }
}
